import type * as Type from "lib/types"
import { compose, rotate, translate } from "transformation-matrix"
import type { ProjectBuilder } from "../project-builder"
import { matchPCBPortsWithFootprintAndMutate } from "../trace-builder/match-pcb-ports-with-footprint"
import { transformSchematicElements } from "../transform-elements"
import {
  ComponentBuilderClass,
  type BaseComponentBuilder,
} from "./ComponentBuilder"

export type InductorBuilderCallback = (rb: InductorBuilder) => unknown
export interface InductorBuilder extends BaseComponentBuilder<InductorBuilder> {
  builder_type: "inductor_builder"
  setSourceProperties(
    properties: Type.SourceSimpleInductor & { name?: string }
  ): InductorBuilder
}

export class InductorBuilderClass
  extends ComponentBuilderClass
  implements InductorBuilder
{
  builder_type = "inductor_builder" as const

  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_inductor",
    }
  }

  setSourceProperties(props: Type.SourceSimpleInductor) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  async build(bc: Type.BuildContext) {
    const elements: Type.AnyElement[] = []
    const { project_builder } = this
    const { ftype } = this.source_properties
    const source_component_id = project_builder.getId(ftype)
    const schematic_component_id = project_builder.getId(
      `schematic_component_${ftype}`
    )
    const pcb_component_id = project_builder.getId(`pcb_component_${ftype}`)
    const source_component = {
      type: "source_component",
      source_component_id,
      name: this.name,
      ...this.source_properties,
    }
    elements.push(source_component)

    const port_arrangement = this.schematic_properties?.port_arrangement
    const schematic_component: Type.SchematicComponent = {
      type: "schematic_component",
      source_component_id,
      schematic_component_id,
      rotation: this.schematic_rotation ?? 0,
      size: { width: 3 / 4, height: 3 / 4 },
      center: this.schematic_position || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)

    const textElements: Type.SchematicText[] = []

    this.ports.addPort("left", { x: -0.5, y: 0 })
    this.ports.addPort("right", { x: 0.5, y: 0 })
    textElements.push({
      type: "schematic_text",
      text: source_component.name,
      schematic_text_id: project_builder.getId("schematic_text"),
      schematic_component_id,
      anchor: "left",
      position: { x: -0.5, y: -0.3 },
      rotation: 0,
    })
    elements.push(
      ...transformSchematicElements(
        [...this.ports.build(bc), ...textElements],
        compose(
          translate(schematic_component.center.x, schematic_component.center.y),
          rotate(schematic_component.rotation)
        )
      )
    )

    const pcb_component = this._createPcbComponent(
      {
        source_component_id,
        pcb_component_id,
      },
      bc
    )
    const footprint_elements = await this.footprint.build(bc)

    matchPCBPortsWithFootprintAndMutate({
      footprint_elements,
      pcb_ports: elements.filter((elm) => elm.type === "pcb_port"),
      source_ports: elements.filter((elm) => elm.type === "source_port"),
    } as any)

    this._computeSizeOfPcbElement(pcb_component, footprint_elements as any)
    elements.push(pcb_component, ...footprint_elements)

    return elements
  }
}

export const createInductorBuilder = (
  project_builder: ProjectBuilder
): InductorBuilder => {
  return new InductorBuilderClass(project_builder)
}
