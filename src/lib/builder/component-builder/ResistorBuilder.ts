import { ProjectBuilder } from "../project-builder"
import { BaseComponentBuilder, ComponentBuilderClass } from "./ComponentBuilder"
import * as Type from "lib/types"
import { transformSchematicElements } from "../transform-elements"
import { compose, rotate, translate } from "transformation-matrix"
import { PortsBuilder } from "../ports-builder/ports-builder"
import { Except } from "type-fest"
import { matchPCBPortsWithFootprintAndMutate } from "../trace-builder/match-pcb-ports-with-footprint"

export type ResistorBuilderCallback = (rb: ResistorBuilder) => unknown
export interface ResistorBuilder extends BaseComponentBuilder<ResistorBuilder> {
  builder_type: "resistor_builder"
  setSourceProperties(
    properties: Except<
      Type.SourceSimpleResistorInput,
      "type" | "source_component_id" | "ftype"
    > & { name?: string }
  ): ResistorBuilder
}

export class ResistorBuilderClass
  extends ComponentBuilderClass
  implements ResistorBuilder
{
  builder_type = "resistor_builder" as const

  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_resistor",
    }
    this.settable_source_properties.push(...["resistance"])
  }

  setSourceProperties(props: Type.SourceSimpleResistor) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  async build(bc: Type.BuildContext) {
    const elements: Type.AnyElement[] = []
    const { ftype } = this.source_properties
    const { project_builder } = this
    const source_component_id = project_builder.getId(ftype)
    const schematic_component_id = project_builder.getId(
      `schematic_component_${ftype}`
    )
    const pcb_component_id = project_builder.getId(`pcb_component_${ftype}`)
    bc = bc.fork({
      source_component_id,
      schematic_component_id,
      pcb_component_id,
    })
    const source_component = {
      type: "source_component",
      source_component_id,
      name: this.name,
      supplier_part_numbers: this.supplier_part_numbers,
      ...this.source_properties,
    }
    elements.push(source_component)

    const port_arrangement = this.schematic_properties?.port_arrangement
    const schematic_component: Type.SchematicComponent = {
      type: "schematic_component",
      source_component_id,
      schematic_component_id,
      rotation: bc.convert(this.schematic_rotation),
      size: {
        width: 1,
        height: 12 / 40,
      },
      center: bc.convert(this.schematic_position) || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)
    this.ports.setPCBComponent(pcb_component_id)

    const textElements: Type.SchematicText[] = []

    this.ports.addPort({
      name: "left",
      center: { x: -0.5, y: 0 },
      facing_direction: "left",
    })
    this.ports.addPort({
      name: "right",
      center: { x: 0.5, y: 0 },
      facing_direction: "right",
    })
    const [text_pos1, text_pos2] =
      schematic_component.rotation === Math.PI / 2 ||
      schematic_component.rotation === -Math.PI / 2
        ? [
            { x: -0.2, y: -0.3 },
            { x: 0, y: -0.3 },
          ]
        : [
            { x: -0.2, y: -0.5 },
            { x: -0.2, y: -0.3 },
          ]

    textElements.push({
      type: "schematic_text",
      text: source_component.name,
      schematic_text_id: project_builder.getId("schematic_text"),
      schematic_component_id,
      anchor: "left",
      position: text_pos1,
      rotation: 0,
    })
    textElements.push({
      type: "schematic_text",
      text: source_component.resistance,
      schematic_text_id: project_builder.getId("schematic_text"),
      schematic_component_id,
      anchor: "left",
      position: text_pos2,
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

    const pcb_element: Type.PCBComponent = {
      type: "pcb_component",
      source_component_id,
      pcb_component_id,
      layer: this.footprint.layer,
      center: bc.convert(this.footprint.position),
      rotation: this.footprint.rotation,
      width: 0,
      height: 0,
    }

    elements.push(pcb_element)

    const footprint_elements = await this.footprint.build(bc)

    matchPCBPortsWithFootprintAndMutate({
      footprint_elements,
      pcb_ports: elements.filter((elm) => elm.type === "pcb_port"),
      source_ports: elements.filter((elm) => elm.type === "source_port"),
    } as any)

    this._computeSizeOfPcbElement(pcb_element, footprint_elements as any)
    elements.push(...footprint_elements)

    return elements
  }
}

export const createResistorBuilder = (
  project_builder: ProjectBuilder
): ResistorBuilder => {
  return new ResistorBuilderClass(project_builder)
}
