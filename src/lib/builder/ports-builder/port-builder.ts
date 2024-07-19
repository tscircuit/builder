import type { Point } from "@tscircuit/soup"
import type * as Type from "lib/types"
import type { Dimension } from "lib/types"
import type { ProjectBuilder } from "../project-builder"

export interface PortBuilder {
  builder_type: "port_builder"
  name: string
  schematic_position: { x: Dimension; y: Dimension }
  schematic_direction: "up" | "down" | "left" | "right"
  pin_number?: number
  port_hints?: string[]
  schematic_pin_number_visible: boolean
  setName(name: string): PortBuilder
  setPinNumber(pin_number: number): PortBuilder
  setSchematicPosition(coords: { x: Dimension; y: Dimension }): PortBuilder
  setSchematicDirection(dir: "up" | "down" | "left" | "right"): PortBuilder
  setSchematicPinNumberVisible(visible: boolean): PortBuilder
  setPortHints(port_hints: string[]): PortBuilder
  setProps: (
    props: Partial<{
      name: string
      x: Dimension
      y: Dimension
      direction: "up" | "down" | "left" | "right"
      pin_number: number
      port_hints: string[]
    }>
  ) => PortBuilder
  build(): Type.AnyElement[]
}

const settable_props = [
  "name",
  "schematic_position",
  "schematic_direction",
  "pin_number",
  "port_hints",
]

export class PortBuilderClass implements PortBuilder {
  builder_type = "port_builder" as const
  project_builder: ProjectBuilder
  name = ""

  schematic_position: Point
  schematic_direction: "up" | "down" | "left" | "right"
  pin_number?: number
  schematic_pin_number_visible: boolean
  port_hints?: string[]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.schematic_position = { x: 0, y: 0 }
    this.schematic_pin_number_visible = true
  }

  setProps(
    props: Partial<{
      name: string
      x: number
      y: number
      direction: "up" | "down" | "left" | "right"
      pin_number: number
      port_hints: string[]
      schematic_pin_number_visible: boolean
    }>
  ): PortBuilder {
    if (props.x !== undefined) this.schematic_position.x = props.x
    if (props.y !== undefined) this.schematic_position.y = props.y
    if (props.direction) this.schematic_direction = props.direction
    if (props.schematic_pin_number_visible !== undefined)
      this.schematic_pin_number_visible = props.schematic_pin_number_visible
    if (props.port_hints)
      this.port_hints = props.port_hints
        .filter(Boolean)
        .map((ph) => ph.toString())
    if (props.name) this.name = props.name

    for (const key of Object.keys(props).filter((k) =>
      settable_props.includes(k)
    )) {
      if (key === "port_hints")
        continue // handled above
      ;(this as any)[key] = props[key]
    }
    return this as unknown as PortBuilder
  }

  setName(name: string): PortBuilder {
    this.name = name
    return this as unknown as PortBuilder
  }

  setPinNumber(pin_number: number): PortBuilder {
    this.pin_number = pin_number
    return this as unknown as PortBuilder
  }

  setPortHints(port_hints: string[]): PortBuilder {
    this.port_hints = port_hints.filter(Boolean).map((ph) => ph.toString())
    return this as unknown as PortBuilder
  }

  setSchematicPosition(point) {
    this.schematic_position = point
    return this as unknown as PortBuilder
  }

  setSchematicDirection(direction) {
    this.schematic_direction = direction
    return this as unknown as PortBuilder
  }

  setSchematicPinNumberVisible(visible: boolean) {
    this.schematic_pin_number_visible = visible
    return this as unknown as PortBuilder
  }

  build(): (
    | {
        type: "source_trace"
        source_trace_id: string
        connected_source_port_ids: string[]
        connected_source_net_ids: string[]
      }
    | {
        type: "source_port"
        source_component_id: string
        name: string
        source_port_id: string
        pin_number?: number
        port_hints?: string[]
      }
    | {
        type: "source_net"
        name: string
        source_net_id: string
        member_source_group_ids: string[]
        is_power?: boolean
        is_ground?: boolean
        is_digital_signal?: boolean
        is_analog_signal?: boolean
        connected_source_trace_ids: string[]
      }
  )[] {
    throw new Error(`"port_builder" must be built via "ports_builder"`)
  }
}

export const createPortBuilder = (
  project_builder: ProjectBuilder
): PortBuilder => {
  return new PortBuilderClass(project_builder)
}
