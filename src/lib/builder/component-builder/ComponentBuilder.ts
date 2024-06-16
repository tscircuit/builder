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
import _ from "lodash"
import { maybeConvertToPoint } from "lib/utils/maybe-convert-to-point"
import { isTruthy } from "lib/utils/is-truthy"
import { removeNulls } from "lib/utils/remove-nulls"
import { SupplierName } from "lib/soup/pcb/properties/supplier_name"
import { remapProp } from "./remap-prop"

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
      Except<Type.SourceComponent, "type" | "source_component_id" | "ftype">
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
  setProps: (
    props: T extends { props?: any } ? T["props"] : any
  ) => BaseComponentBuilder<T>
  setFootprint(fp: FootprintBuilder | string): BaseComponentBuilder<T>
  modifyFootprint(cb: (fb: FootprintBuilder) => any): BaseComponentBuilder<T>
  modifyPorts(cb: (pb: PortsBuilder) => any): BaseComponentBuilder<T>
  modifySchematic(
    cb: (fb: SchematicSymbolBuilder) => any
  ): BaseComponentBuilder<T>
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
  name: string | null = null
  // manufacturer_part_numbers: string[]
  supplier_part_numbers: Partial<Record<SupplierName, string[]>>
  builder_type = "generic_component_builder" as any
  tags: string[] = []
  source_properties: any = {}
  pcb_properties: any = {}
  schematic_properties: any = {}
  schematic_rotation: number = 0
  schematic_position: Type.Point = { x: 0, y: 0 }
  settable_source_properties: string[]
  settable_schematic_properties: string[]
  settable_pcb_properties: string[]
  fixed_schematic_size: { width: number; height: number } | null = null
  ports: PortsBuilder
  footprint: FootprintBuilder
  schematic_symbol: SchematicSymbolBuilder
  constructor(public project_builder: ProjectBuilder) {
    this.ports = createPortsBuilder(project_builder)
    this.footprint = createFootprintBuilder(project_builder)
    this.schematic_symbol = createSchematicSymbolBuilder(project_builder)
    this.settable_source_properties = ["name", "part_numbers"]
    this.settable_schematic_properties = ["pin_spacing"]
    this.settable_pcb_properties = []
    // this.part_numbers = []
    this.supplier_part_numbers = {}
  }

  appendChild(child) {
    // Based on the child type, add to appropriate builder
    switch (child.builder_type) {
      case "port_builder": {
        this.ports.appendChild(child)
        return this
      }
      case "smtpad_builder":
      case "basic_pcb_trace_builder":
      case "pcb_trace_builder":
      case "plated_hole_builder": {
        this.footprint.appendChild(child)
        return this
      }
      case "schematic_symbol_builder": {
        // TODO merge
        this.schematic_symbol = child
        return this
      }
      case "schematic_path_builder":
      case "schematic_line_builder":
      case "schematic_text_builder":
      case "schematic_box_builder": {
        this.schematic_symbol.appendChild(child)
        return this
      }
      case "footprint_builder": {
        // TODO merge
        this.footprint = child
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
    this.source_properties.name = name
    return this
  }

  setFType(ftype: string) {
    this.source_properties.ftype = ftype
    return this
  }

  setSourceProperties(props) {
    if (props.name) {
      this.name = props.name
    }
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  /**
   * This is the main way that React sets props for a component. We need to
   * map the prop to the relevant builder, also handle a lot of shorthands
   */
  setProps(props) {
    const unused_props: string[] = []

    // Remap props e.g. schPortArrangement -> port_arrangement
    for (const [prop_key, prop_val] of Object.entries(props)) {
      const [remapped_key, remapped_val] = remapProp(prop_key, prop_val)
      if (prop_key !== remapped_key) {
        props[remapped_key] = remapped_val
      }
    }

    for (const [prop_key, prop_val] of Object.entries(props)) {
      const point = maybeConvertToPoint(prop_val)

      if (prop_key === "schematic_x" && "schematic_y" in props) {
        this.setSchematicCenter(prop_val, props.schematic_y)
      } else if (prop_key === "sch_x" && "sch_y" in props) {
        this.setSchematicCenter(prop_val, props.sch_y)
      } else if (prop_key === "cx" && "cy" in props) {
        this.setSchematicCenter(prop_val, props.cy)
      } else if (
        (prop_key === "schematic_center" || prop_key === "center") &&
        point
      ) {
        this.setSchematicCenter(point.x, point.y)
      } else if (prop_key === "x" && "y" in props) {
        this.setSchematicCenter(prop_val, props.y)
      } else if (prop_key === "pcb_x" && "pcb_y" in props) {
        this.setFootprintCenter(prop_val, props.pcb_y)
      } else if (prop_key === "pcb_cx" && "pcb_cy" in props) {
        this.setFootprintCenter(prop_val, props.pcb_cy)
      } else if (prop_key === "pcb_center" && point) {
        this.setFootprintCenter(prop_val, props.pcb_y)
      } else if (prop_key === "port_arrangement") {
        this.setSchematicProperties({ port_arrangement: prop_val })
      } else if (prop_key === "port_labels") {
        this.setSchematicProperties({ port_labels: prop_val })
      } else if (
        ["y", "schematic_y", "pcb_y", "sch_y", "cy"].includes(prop_key)
      ) {
        // covered in check for x
      } else if (prop_key === "schematic_properties") {
        this.setSchematicProperties(prop_val)
      } else if (prop_key === "footprint" && typeof prop_val === "string") {
        this.setFootprint(prop_val as any)
      } else if (
        prop_key === "footprint" &&
        (prop_val as any)?.builder_type === "footprint_builder"
      ) {
        this.setFootprint(prop_val as any)
      } else if (prop_key === "pcb_layer" || prop_key === "layer") {
        this.footprint.setLayer(prop_val as any)
      } else if (prop_key === "schematic_rotation" || prop_key === "rotation") {
        this.setSchematicRotation(prop_val)
      } else if (prop_key === "pcb_rotation") {
        this.setFootprintRotation(prop_val as any)
      } else if (prop_key === "footprint_center" && point) {
        this.setFootprintCenter(point.x, point.y)
      } else if (this.settable_source_properties.includes(prop_key)) {
        this.setSourceProperties({ [prop_key]: prop_val })
      } else if (this.settable_schematic_properties.includes(prop_key)) {
        this.setSchematicProperties({ [prop_key]: prop_val })
      } else if (this.settable_pcb_properties.includes(prop_key)) {
        this.setPcbProperties({ [prop_key]: prop_val })
      } else if (prop_key === "supplier_part_numbers") {
        if (typeof prop_val === "object") {
          const spns: typeof this.supplier_part_numbers = {}
          for (const supplier_name in prop_val) {
            const suppler_val = prop_val[supplier_name]
            if (typeof suppler_val === "string") {
              spns[supplier_name as SupplierName] = [prop_val[supplier_name]]
            } else {
              spns[supplier_name as SupplierName] = prop_val[supplier_name]
            }
          }
          this.supplier_part_numbers = spns
        } else {
          throw new Error("supplier_part_numbers must be an object")
        }
      } else if (prop_key === "children") {
        // SPECIAL CASE: Bug in upstream code causes "children" to sometimes be
        // passed, we want to totally ignore this and not add it to unused props
      } else {
        unused_props.push(prop_key)
        // console.warn(`Unused property passed: "${prop_key}"`)
      }
    }

    // Legacy Compat: Set all remaining properties as source properties
    this.setSourceProperties(
      unused_props.reduce((agg, prop_key) => {
        agg[prop_key] = props[prop_key]
        return agg
      }, {})
    )

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

  setPcbProperties(props) {
    this.pcb_properties = {
      ...this.pcb_properties,
      ...props,
    }
    return this
  }

  setFootprint(fp: FootprintBuilder | string) {
    if (typeof fp === "string") {
      this.footprint.loadStandardFootprint(fp)
    } else if (fp?.builder_type === "footprint_builder") {
      const old_footprint = this.footprint
      this.footprint = fp

      // Copy position or any other mutations
      // NOTE: It's not clear this is the right thing to do- maybe the footprint
      // should get it's own position put on it~
      this.footprint.setPosition(
        old_footprint.position.x,
        old_footprint.position.y
      )
      this.footprint.setRotation(old_footprint.rotation)
    }
    return this
  }

  modifyFootprint(fn) {
    fn(this.footprint)
    return this
  }

  modifyPorts(fn) {
    fn(this.ports)
    return this
  }

  modifySchematic(fn) {
    fn(this.schematic_symbol)
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

  configureFootprint(bc) {
    return this
  }

  configurePorts(bc) {
    return this
  }

  _createPcbComponent(
    opts: {
      source_component_id: string
      pcb_component_id: string
    },
    bc: Type.BuildContext
  ): Type.PCBComponent {
    return {
      type: "pcb_component",
      source_component_id: opts.source_component_id,
      pcb_component_id: opts.pcb_component_id,
      layer: this.footprint.layer,
      center: bc.convert(this.footprint.position),
      rotation: this.footprint.rotation,
      width: 0,
      height: 0,
    }
  }

  _computeSizeOfPcbElement(
    pcb_element: Type.PCBComponent,
    footprint_elements: Type.AnySoupElement[]
  ) {
    const pcb_size = getSpatialBoundsFromSpatialElements(
      footprint_elements
        .map((elm) => {
          try {
            return toCenteredSpatialObj(elm)
          } catch (e) {
            return null
          }
        })
        .filter(isTruthy)
    )
    pcb_element.width = pcb_size.w
    pcb_element.height = pcb_size.h
  }

  async build(bc: Type.BuildContext) {
    const pb = this.project_builder
    const elements: Type.AnyElement[] = []

    const ftype = this.source_properties.ftype ?? "generic"

    const source_component_id = pb.getId(ftype)
    const schematic_component_id = pb.getId(`schematic_${ftype}_component`)
    const pcb_component_id = pb.getId(`pcb_${ftype}_component`)

    this.ports
      .setSchematicComponent(schematic_component_id)
      .setSourceComponent(source_component_id)
      .setPCBComponent(pcb_component_id)

    bc = bc.fork({
      source_component_id,
      schematic_component_id,
      pcb_component_id,
    })

    const source_component: Type.SourceComponent = removeNulls({
      type: "source_component",
      source_component_id,
      name: this.name,
      ftype: this.source_properties.ftype,
      supplier_part_numbers: this.supplier_part_numbers,
    })

    elements.push(source_component)

    // Build schematic component

    const schematic_component: Type.SchematicComponent = {
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
    const pcb_element = this._createPcbComponent(
      {
        source_component_id,
        pcb_component_id,
      },
      bc
    )

    this.configureFootprint({
      ...bc,
      props: {
        ...this.source_properties,
        ...this.schematic_properties,
        ...this.pcb_properties,
      },
    })

    const footprint_elements = await this.footprint.build(bc)

    for (const fe of footprint_elements) {
      ;(fe as any).pcb_component_id = pcb_component_id
    }

    this.configureSchematicSymbols({
      ...bc,
      source_properties: this.source_properties,
    })
    const schematic_elements = await this.schematic_symbol.build(bc)

    const pcb_ports = elements
      .concat(built_ports)
      .filter((elm) => elm.type === "pcb_port")
    const source_ports = elements
      .concat(built_ports)
      .filter((elm) => elm.type === "source_port")

    matchPCBPortsWithFootprintAndMutate({
      footprint_elements,
      pcb_ports,
      source_ports,
    } as any)

    // If any pcb_port isn't matched, emit an error
    // TODO currently undefined x/y ports mean it's not matched
    for (const pp of pcb_ports) {
      if (pp.type === "pcb_port" && pp.x === undefined && pp.y === undefined) {
        const source_port = source_ports.find(
          (elm) =>
            elm.type === "source_port" &&
            elm.source_port_id === pp.source_port_id
        )! as Type.SourcePort
        elements.push({
          pcb_error_id: pb.getId("pcb_error"),
          type: "pcb_error",
          message: `Could not find a matching footprint for pcb_port "${source_port?.name}" (inside "${source_component.name}")`,
          error_type: "pcb_port_not_matched_error",
          pcb_component_ids: [pcb_component_id],
        })
      }
    }

    this._computeSizeOfPcbElement(pcb_element, footprint_elements as any)
    elements.push(pcb_element, ...footprint_elements)

    // SPATIAL ADJUSTMENTS
    // 1. Transform and rotate according to the specified center and rotation
    // 2. Compute the spatial bounds of the schematic elements
    // 3. Shift the component center to reflect the components orientation about
    //    center
    // TODO change "center" to "origin" in the api to prevent confusion between
    // user-specified "center" and computed "center"

    const transformed_schematic_elements = transformSchematicElements(
      [
        ...built_ports.filter((bp) => bp.type === "schematic_port"),
        ...schematic_elements,
      ],
      compose(
        translate(schematic_component.center.x, schematic_component.center.y),
        rotate(schematic_component.rotation)
      )
    )

    elements.push(
      ...transformed_schematic_elements,
      ...built_ports.filter((bp) => bp.type !== "schematic_port")
    )

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
        .filter(isTruthy)
    )

    schematic_component.center.x = schematic_spatial_bounds.x
    schematic_component.center.y = schematic_spatial_bounds.y

    if (this.fixed_schematic_size) {
      schematic_component.size = this.fixed_schematic_size
    } else {
      schematic_component.size.width = schematic_spatial_bounds.w
      schematic_component.size.height = schematic_spatial_bounds.h
    }

    return elements
  }
}

export const createComponentBuilder = (
  project_builder: ProjectBuilder
): GenericComponentBuilder => {
  return new ComponentBuilderClass(project_builder)
}
