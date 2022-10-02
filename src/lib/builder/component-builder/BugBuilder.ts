import { ProjectBuilder } from "../project-builder"
import { BaseComponentBuilder, ComponentBuilderClass } from "./ComponentBuilder"
import * as Type from "lib/types"
import { transformSchematicElements } from "../transform-elements"
import { compose, rotate, translate } from "transformation-matrix"
import { PortsBuilder } from "../ports-builder"
import { Except } from "type-fest"
import getPortPosition from "./get-port-position"

export type BugBuilderCallback = (rb: BugBuilder) => unknown
export interface BugBuilder extends BaseComponentBuilder<BugBuilder> {
  setSourceProperties(
    properties: Except<
      Type.SimpleBug,
      "type" | "source_component_id" | "ftype" | "name"
    > & { name?: string }
  ): BugBuilder
}

export class BugBuilderClass
  extends ComponentBuilderClass
  implements BugBuilder
{
  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_bug",
    }
  }

  setSourceProperties(props: Type.SimpleBug) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  async build() {
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
        width:
          Math.max(
            port_arrangement.top_size ?? 0,
            port_arrangement.bottom_size ?? 0,
            1
          ) + 0.5,
        height: Math.max(
          (port_arrangement.left_size ?? 0) / 2,
          (port_arrangement.right_size ?? 0) / 2,
          1
        ),
      },
      center: this.schematic_position || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)

    const textElements = []

    // add ports based on port arrangement and give appropriate labels
    const { port_labels } = this.schematic_properties
    for (
      let i = 0;
      i < port_arrangement.left_size + port_arrangement.right_size;
      i++
    ) {
      const is_left = i < port_arrangement.left_size
      const portPosition = getPortPosition(port_arrangement, i)
      this.ports.add({
        name: port_labels[i + 1],
        center: portPosition,
        facing_direction: is_left ? "left" : "right",
      })
      const schematic_text_id = this.project_builder.getId("schematic_text")
      const portText: Type.SchematicText = {
        type: "schematic_text",
        schematic_text_id,
        schematic_component_id,
        text: port_labels[i + 1],
        anchor: is_left ? "left" : "right",
        position: {
          x: portPosition.x + (is_left ? 0.3 : -0.3),
          y: portPosition.y,
        },
      }
      textElements.push(portText)
    }

    elements.push(
      ...transformSchematicElements(
        [...this.ports.build(), ...textElements],
        compose(
          translate(schematic_component.center.x, schematic_component.center.y),
          rotate(schematic_component.rotation)
        )
      )
    )

    elements.push({
      type: "pcb_component",
      source_component_id,
      pcb_component_id,
    })
    return elements
  }
}

export const createBugBuilder = (
  project_builder: ProjectBuilder
): BugBuilder => {
  return new BugBuilderClass(project_builder)
}
