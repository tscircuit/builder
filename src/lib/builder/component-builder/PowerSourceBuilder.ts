import type * as Type from "lib/types"
import { compose, rotate, translate } from "transformation-matrix"
import type { Except } from "type-fest"
import type { ProjectBuilder } from "../project-builder"
import { matchPCBPortsWithFootprintAndMutate } from "../trace-builder/match-pcb-ports-with-footprint"
import { transformSchematicElements } from "../transform-elements"
import {
  ComponentBuilderClass,
  type BaseComponentBuilder,
} from "./ComponentBuilder"

export type PowerSourceBuilderCallback = (rb: PowerSourceBuilder) => unknown
export interface PowerSourceBuilder
  extends BaseComponentBuilder<PowerSourceBuilder> {
  builder_type: "power_source_builder"
  setSourceProperties(
    properties: Except<
      Type.SourceSimplePowerSourceInput,
      "type" | "source_component_id" | "ftype"
    > & { name?: string }
  ): PowerSourceBuilder
}

export class PowerSourceBuilderClass
  extends ComponentBuilderClass
  implements PowerSourceBuilder
{
  builder_type = "power_source_builder" as const
  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_power_source",
    }
    this.settable_source_properties.push(...["voltage"])
  }

  setSourceProperties(props: Type.SourceSimplePowerSource) {
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
      size: { width: (1 * 24) / 34, height: 1 },
      center: this.schematic_position || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)

    const textElements = []

    this.ports.addPort({
      name: "positive",
      center: { x: 0, y: -0.5 },
      facing_direction: "up",
    })
    this.ports.addPort({
      name: "negative",
      center: { x: 0, y: 0.5 },
      facing_direction: "down",
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

export const createPowerSourceBuilder = (
  project_builder: ProjectBuilder
): PowerSourceBuilder => {
  return new PowerSourceBuilderClass(project_builder)
}
