import * as Type from "lib/types"
import { Except, Simplify } from "type-fest"
import { ProjectBuilder } from "lib/builder/project-builder"
import {
  PortsBuilder,
  createPortsBuilder,
} from "lib/builder/ports-builder/ports-builder"
import { compose, rotate, transform, translate } from "transformation-matrix"
import { transformSchematicElements } from "lib/builder/transform-elements"
import getPortPosition from "../../utils/get-port-position"
import { AnyElement, Point, SchematicComponent } from "lib/types"
import { createFootprintBuilder, FootprintBuilder } from "../footprint-builder"
import {
  createSchematicSymbolBuilder,
  SchematicSymbolBuilder,
} from "../schematic-symbol-builder"
import {
  getSpatialBoundsFromSpatialElements,
  toCenteredSpatialObj,
} from "../constrained-layout-builder/spatial-util"
import { matchPCBPortsWithFootprintAndMutate } from "../trace-builder/match-pcb-ports-with-footprint"

export interface BaseComponentBuilder<T> {
  project_builder: ProjectBuilder
  ports: PortsBuilder
  footprint: FootprintBuilder
  schematic_symbol: SchematicSymbolBuilder
  setName: (name: string) => BaseComponentBuilder<T>
  setTag: (tag: string) => BaseComponentBuilder<T>
  setTags: (tags: string[]) => BaseComponentBuilder<T>
  appendChild(child: { builder_type: string }): BaseComponentBuilder<T>
  setSourceProperties(
    properties: Simplify<
      Except<
        Type.SourceComponent,
        "type" | "source_component_id" | "ftype" | "name"
      >
    > & { name?: string }
  ): BaseComponentBuilder<T>
  setSchematicCenter(
    x: number | string,
    y: number | string
  ): BaseComponentBuilder<T>
  setSchematicRotation(
    rotation: number | `${number}deg`
  ): BaseComponentBuilder<T>
  setSchematicProperties(
    properties: Partial<Type.SchematicComponent>
  ): BaseComponentBuilder<T>
  setFootprintCenter(
    x: number | string,
    y: number | string
  ): BaseComponentBuilder<T>
  setFootprintRotation(
    rotation: number | `${number}deg`
  ): BaseComponentBuilder<T>
  setFootprint(fp: FootprintBuilder | string): BaseComponentBuilder<T>
  modifyFootprint(cb: (fb: FootprintBuilder) => any): BaseComponentBuilder<T>
  labelPort(position: number, name: string): BaseComponentBuilder<T>
  build(build_context: Type.BuildContext): Promise<Type.AnyElement[]>
}

export type GenericComponentBuilder =
  BaseComponentBuilder<GenericComponentBuilder> & {
    builder_type: "generic_component_builder"
    setFType: (ftype: string) => GenericComponentBuilder
  }
export type GenericComponentBuilderCallback = (
  cb: GenericComponentBuilder
) => unknown

export class ComponentBuilderClass implements GenericComponentBuilder {
  name: string = null
  builder_type = "generic_component_builder" as any
  tags: string[] = []
  source_properties: any = {}
  schematic_properties: any = {}
  schematic_rotation: number = 0
  schematic_position: Point = { x: 0, y: 0 }
  ports: PortsBuilder
  footprint: FootprintBuilder
  schematic_symbol: SchematicSymbolBuilder
  constructor(public project_builder: ProjectBuilder) {
    this.ports = createPortsBuilder(project_builder)
    this.footprint = createFootprintBuilder(project_builder)
    this.schematic_symbol = createSchematicSymbolBuilder(project_builder)
  }

  appendChild(child) {
    // Based on the child type, add to appropriate builder
    switch (child.builder_type) {
      case "port_builder": {
        this.ports.appendChild(child)
        return this
      }
      case "smtpad_builder": {
        this.footprint.appendChild(child)
        return this
      }
      case "plated_hole_builder": {
        this.footprint.appendChild(child)
        return this
      }
      case "schematic_symbol_builder": {
        // TODO merge
        this.schematic_symbol = child
        return this
      }
      case "schematic_box_builder": {
        this.schematic_symbol.appendChild(child)
        return this
      }
      case "schematic_line_builder": {
        this.schematic_symbol.appendChild(child)
        return this
      }
      case "schematic_text_builder": {
        this.schematic_symbol.appendChild(child)
        return this
      }
    }

    throw new Error(
      `Can't add child builder type: "${child.builder_type}" inside component builder`
    )
  }

  setTag(tag) {
    this.tags.push(tag)
    return this
  }

  setTags(tags) {
    this.tags.push(...tags)
    return this
  }

  setName(name) {
    this.name = name
    return this
  }

  setFType(ftype: string) {
    this.source_properties.ftype = ftype
    return this
  }

  setSourceProperties(props) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  setSchematicCenter(x, y) {
    this.schematic_position = { x, y }
    return this
  }

  setFootprintCenter(x, y) {
    this.footprint.setPosition(x, y)
    return this
  }

  setSchematicRotation(rotation) {
    if (typeof rotation === "number") {
      this.schematic_rotation = rotation
    } else {
      this.schematic_rotation =
        (parseFloat(rotation.split("deg")[0]) / 180) * Math.PI
    }
    return this
  }

  setFootprintRotation(rotation: number | `${number}deg`) {
    this.footprint.setRotation(rotation)
    return this
  }

  setSchematicProperties(props) {
    this.schematic_properties = {
      ...this.schematic_properties,
      ...props,
    }
    return this
  }

  setFootprint(fp: FootprintBuilder | SparkfunComponentId) {
    if (typeof fp === "string") {
      this.footprint.loadStandardFootprint(fp)
    } else {
      this.footprint = fp
    }
    return this
  }

  modifyFootprint(fn) {
    fn(this.footprint)
    return this
  }

  labelPort(position, name) {
    this.schematic_properties.port_labels ??= {}
    this.schematic_properties.port_labels[position] = name
    return this
  }

  configureSchematicSymbols(bc) {
    return this
  }

  configurePorts(bc) {
    return this
  }

  async build(bc: Type.BuildContext) {
    const pb = this.project_builder
    const elements = []

    const ftype = this.source_properties.ftype ?? "generic"

    const source_component_id = pb.getId(ftype)
    const schematic_component_id = pb.getId(`schematic_${ftype}_component`)
    const pcb_component_id = pb.getId(`pcb_${ftype}_component`)
    bc = bc.fork({
      source_component_id,
      schematic_component_id,
      pcb_component_id,
    })

    const source_component = {
      type: "source_component",
      source_component_id,
      name: this.name,
      ftype: this.source_properties.ftype,
    }

    elements.push(source_component)

    // Build schematic component

    const schematic_component: SchematicComponent = {
      type: "schematic_component",
      schematic_component_id,
      source_component_id,
      center: bc.convert(this.schematic_position),
      rotation: this.schematic_rotation,
      size: { width: 1, height: 1 },
    }

    elements.push(schematic_component)

    this.configurePorts({ ...bc, source_properties: this.source_properties })

    const built_ports = await this.ports.build(bc)

    // TODO schematic box of some kind
    const pcb_element = {
      type: "pcb_component",
      source_component_id,
      pcb_component_id,
    }

    const footprint_elements = await this.footprint.build(bc)

    for (const fe of footprint_elements) {
      ;(fe as any).pcb_component_id = pcb_component_id
    }

    this.configureSchematicSymbols({
      ...bc,
      source_properties: this.source_properties,
    })
    const schematic_elements = await this.schematic_symbol.build(bc)

    matchPCBPortsWithFootprintAndMutate({
      footprint_elements,
      pcb_ports: elements.filter((elm) => elm.type === "pcb_port"),
      source_ports: elements.filter((elm) => elm.type === "source_port"),
    } as any)

    elements.push(pcb_element, ...footprint_elements)

    // SPATIAL ADJUSTMENTS
    // 1. Transform and rotate according to the specified center and rotation
    // 2. Compute the spatial bounds of the schematic elements
    // 3. Shift the component center to reflect the components orientation about
    //    center
    // TODO change "center" to "origin" in the api to prevent confusion between
    // user-specified "center" and computed "center"

    const transformed_schematic_elements = transformSchematicElements(
      [...built_ports, ...schematic_elements],
      compose(
        translate(schematic_component.center.x, schematic_component.center.y),
        rotate(schematic_component.rotation)
      )
    )

    elements.push(...transformed_schematic_elements)

    // Compute the spatial bounds of the schematic elements
    const schematic_spatial_bounds = getSpatialBoundsFromSpatialElements(
      transformed_schematic_elements
        .map((elm) => {
          try {
            return toCenteredSpatialObj(elm)
          } catch (e) {
            return null
          }
        })
        .filter(Boolean)
    )

    schematic_component.center.x = schematic_spatial_bounds.x
    schematic_component.center.y = schematic_spatial_bounds.y
    schematic_component.size.width = schematic_spatial_bounds.w
    schematic_component.size.height = schematic_spatial_bounds.h

    return elements
  }
}

export const createComponentBuilder = (
  project_builder: ProjectBuilder
): GenericComponentBuilder => {
  return new ComponentBuilderClass(project_builder)
}
