import type * as Type from "lib/types"
import { compose, rotate, translate } from "transformation-matrix"
import type { Except } from "type-fest"
import type { ProjectBuilder } from "../project-builder"
import { transformSchematicElements } from "../transform-elements"
import {
  ComponentBuilderClass,
  type BaseComponentBuilder,
} from "./ComponentBuilder"

export type GroundBuilderCallback = (rb: GroundBuilder) => unknown
export interface GroundBuilder extends BaseComponentBuilder<GroundBuilder> {
  builder_type: "ground_builder"
  setSourceProperties(
    properties: Except<
      Type.SourceSimpleGroundInput,
      "type" | "source_component_id" | "ftype" | "name"
    > & { name?: string }
  ): GroundBuilder
}

export class GroundBuilderClass
  extends ComponentBuilderClass
  implements GroundBuilder
{
  builder_type = "ground_builder" as const

  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_ground",
    }
  }

  setSourceProperties(props: Type.SourceSimpleGround) {
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
      size: {
        width: 0.5,
        height: (0.5 * 15) / 18,
      },
      center: this.schematic_position || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)

    const textElements = []

    this.ports.addPort({
      name: "gnd",
      center: { x: 0, y: -0.2 },
      facing_direction: "up",
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

    this._computeSizeOfPcbElement(pcb_component, footprint_elements as any)

    elements.push(pcb_component, ...footprint_elements)

    return elements
  }
}

export const createGroundBuilder = (
  project_builder: ProjectBuilder
): GroundBuilder => {
  return new GroundBuilderClass(project_builder)
}
