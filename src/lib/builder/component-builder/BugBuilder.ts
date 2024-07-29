import type * as Soup from "@tscircuit/soup"
import type { SchematicText, SourceSimpleBugInput } from "@tscircuit/soup"
import Debug from "debug"
import type * as Type from "lib/types"
import { convertSideToDirection } from "lib/utils/convert-side-to-direction"
import { compose, rotate, translate } from "transformation-matrix"
import type { Except } from "type-fest"
import getPortPosition, {
  DEFAULT_PIN_SPACING,
  getPortArrangementSize,
  getPortIndices,
} from "../../utils/get-port-position"
import { associatePcbPortsWithPads } from "../footprint-builder/associate-pcb-ports-with-pads"
import type { ProjectBuilder } from "../project-builder"
import { transformSchematicElements } from "../transform-elements"
import {
  type BaseComponentBuilder,
  ComponentBuilderClass,
} from "./ComponentBuilder"

const debug = Debug("tscircuit:builder:bug-builder")

export type BugBuilderCallback = (rb: BugBuilder) => unknown
export interface BugBuilder extends BaseComponentBuilder<BugBuilder> {
  builder_type: "bug_builder"
  setSourceProperties(
    properties: Except<
      SourceSimpleBugInput,
      "type" | "source_component_id" | "ftype" | "name"
    > & { name?: string; schWidth?: number }
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
    this.settable_schematic_properties.push(
      "port_labels",
      "port_arrangement",
      "pin_spacing",
      "schWidth"
    )
  }

  setSourceProperties(props) {
    this.source_properties = {
      ...this.source_properties,
      ...props,
    }
    return this
  }

  setSchematicProperties(props) {
    this.schematic_properties = {
      ...this.schematic_properties,
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
      supplier_part_numbers: this.supplier_part_numbers,
      ...this.source_properties,
    }
    elements.push(source_component)

    const port_arrangement = this.schematic_properties?.port_arrangement

    if (!port_arrangement) {
      throw new Error("port_arrangement is required when building a <bug />")
    }

    const pin_spacing =
      this.schematic_properties?.pin_spacing ?? DEFAULT_PIN_SPACING

    const extended_port_arrangement = {
      ...port_arrangement,
      pin_spacing: this.schematic_properties.pin_spacing,
      schWidth: this.source_properties.schPortArrangement.schWidth,
    }

    const port_arrangement_size = getPortArrangementSize(
      extended_port_arrangement
    )

    const schematic_component: Soup.SchematicComponent = {
      type: "schematic_component",
      source_component_id,
      schematic_component_id,
      rotation: this.schematic_rotation ?? 0,
      size: {
        width: port_arrangement_size.width,
        height: port_arrangement_size.height,
      },
      center: this.schematic_position || { x: 0, y: 0 },
      ...this.schematic_properties,
    }
    elements.push(schematic_component)

    this.ports.setSchematicComponent(schematic_component_id)
    this.ports.setSourceComponent(source_component_id)
    this.ports.setPCBComponent(pcb_component_id)

    const textElements: SchematicText[] = []

    // add ports based on port arrangement and give appropriate labels
    const { port_labels } = this.schematic_properties
    const { total_ports } = port_arrangement_size

    if (!port_labels) {
      throw new Error("port_labels is required when building a <bug />")
    }

    const port_indices = getPortIndices(extended_port_arrangement)
    for (const pn of port_indices) {
      const portPosition = getPortPosition(extended_port_arrangement, pn)
      this.ports.addPort({
        name: port_labels[pn],
        pin_number: pn,
        port_hints: [port_labels[pn], pn],
        center: { x: portPosition.x, y: portPosition.y },
        facing_direction: convertSideToDirection(portPosition.side),
      })
      const schematic_text_id = this.project_builder.getId("schematic_text")

      if (["left", "right"].includes(portPosition.side)) {
        const is_left = portPosition.side === "left"
        const portText: SchematicText = {
          type: "schematic_text",
          schematic_text_id,
          schematic_component_id,
          text: port_labels[pn],
          anchor: is_left ? "left" : "right",
          rotation: 0,
          position: {
            x: portPosition.x + (is_left ? 0.8 : -0.8) * pin_spacing,
            y: portPosition.y,
          },
        }
        textElements.push(portText)
      }
      if (portPosition.side === "bottom") {
        const portText: SchematicText = {
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
        const portText: SchematicText = {
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

    const built_ports = this.ports.build(bc)

    elements.push(
      ...transformSchematicElements(
        [...built_ports, ...textElements],
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
    for (const fe of footprint_elements) {
      ;(fe as any).pcb_component_id = pcb_component_id
    }

    this._computeSizeOfPcbElement(pcb_component, footprint_elements as any)
    elements.push(pcb_component, ...footprint_elements)

    associatePcbPortsWithPads(elements)

    elements.push(
      ...this._getCadElements({ source_component_id, pcb_component }, bc)
    )

    return elements
  }
}

export const createBugBuilder = (
  project_builder: ProjectBuilder
): BugBuilder => {
  return new BugBuilderClass(project_builder)
}
