import { ProjectBuilder } from "../project-builder"
import { BaseComponentBuilder, ComponentBuilderClass } from "./ComponentBuilder"
import * as Type from "lib/types"
import { transformSchematicElements } from "../transform-elements"
import { compose, rotate, translate } from "transformation-matrix"
import { PortsBuilder } from "../ports-builder"
import { Except } from "type-fest"
import getPortPosition, {
  getPortArrangementSize,
  getPortIndices,
} from "../../utils/get-port-position"
import { convertSideToDirection } from "lib/utils/convert-side-to-direction"
import { associatePcbPortsWithPads } from "../footprint-builder/associate-pcb-ports-with-pads"

export type BugBuilderCallback = (rb: BugBuilder) => unknown
export interface BugBuilder extends BaseComponentBuilder<BugBuilder> {
  builder_type: "bug_builder"
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
  builder_type = "bug_builder" as const

  constructor(project_builder: ProjectBuilder) {
    super(project_builder)
    this.source_properties = {
      ...this.source_properties,
      ftype: "simple_bug",
    }
    this.settable_schematic_properties.push("port_labels", "port_arrangement")
  }

  setSourceProperties(props) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  async build(bc): Promise<Type.AnyElement[]> {
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

    if (!port_arrangement) {
      throw new Error("port_arrangement is required when building a <bug />")
    }

    const port_arrangement_size = getPortArrangementSize(port_arrangement)
    const schematic_component: Type.SchematicComponent = {
      type: "schematic_component",
      source_component_id,
      schematic_component_id,
      rotation: this.schematic_rotation ?? 0,
      size: {
        width: port_arrangement_size.width - 0.5,
        height: port_arrangement_size.height - 0.5,
      },
      center: this.schematic_position || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)

    const textElements: Type.SchematicText[] = []

    // add ports based on port arrangement and give appropriate labels
    const { port_labels } = this.schematic_properties
    const { total_ports } = port_arrangement_size

    if (!port_labels) {
      throw new Error("port_labels is required when building a <bug />")
    }

    const port_indices = getPortIndices(port_arrangement)
    for (const pn of port_indices) {
      const portPosition = getPortPosition(port_arrangement, pn)
      this.ports.addPort({
        name: port_labels[pn],
        pin_number: pn,
        center: { x: portPosition.x, y: portPosition.y },
        facing_direction: convertSideToDirection(portPosition.side),
      })
      const schematic_text_id = this.project_builder.getId("schematic_text")

      if (["left", "right"].includes(portPosition.side)) {
        const is_left = portPosition.side === "left"
        const portText: Type.SchematicText = {
          type: "schematic_text",
          schematic_text_id,
          schematic_component_id,
          text: port_labels[pn],
          anchor: is_left ? "left" : "right",

          rotation: 0,

          position: {
            x: portPosition.x + (is_left ? 0.4 : -0.4),
            y: portPosition.y,
          },
        }
        textElements.push(portText)
      }
      if (portPosition.side === "bottom") {
        const portText: Type.SchematicText = {
          type: "schematic_text",
          schematic_text_id,
          schematic_component_id,
          text: port_labels[pn],
          anchor: "right",
          rotation: Math.PI / 2,

          position: {
            x: portPosition.x,
            y: portPosition.y - 0.4,
          },
        }
        textElements.push(portText)
      }
      if (portPosition.side === "top") {
        const portText: Type.SchematicText = {
          type: "schematic_text",
          schematic_text_id,
          schematic_component_id,
          text: port_labels[pn],
          anchor: "left",
          rotation: Math.PI / 2,

          position: {
            x: portPosition.x,
            y: portPosition.y + 0.4,
          },
        }
        textElements.push(portText)
      }
    }

    elements.push(
      ...transformSchematicElements(
        [...this.ports.build(bc), ...textElements],
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
    elements.push(...(await this.footprint.build(bc)))

    associatePcbPortsWithPads(elements)

    return elements
  }
}

export const createBugBuilder = (
  project_builder: ProjectBuilder
): BugBuilder => {
  return new BugBuilderClass(project_builder)
}
