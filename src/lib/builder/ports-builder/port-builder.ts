import * as Type from "lib/types"
import { Dimension } from "lib/types"
import { ProjectBuilder } from "../project-builder"

export interface PortBuilder {
  builder_type: "port_builder"
  name: string
  schematic_position: { x: Dimension; y: Dimension }
  schematic_direction: "up" | "down" | "left" | "right"
  pin_number?: number
  setName(name: string): PortBuilder
  setPinNumber(pin_number: number): PortBuilder
  setSchematicPosition(coords: { x: Dimension; y: Dimension }): PortBuilder
  setSchematicDirection(dir: "up" | "down" | "left" | "right"): PortBuilder
  build(): Type.AnyElement[]
}

const settable_props = [
  "name",
  "schematic_position",
  "schematic_direction",
  "pin_number",
]

export class PortBuilderClass implements PortBuilder {
  builder_type = "port_builder" as const
  project_builder: ProjectBuilder
  name: string = ""

  schematic_position: Type.Point
  schematic_direction: "up" | "down" | "left" | "right"
  pin_number?: number

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.schematic_position = { x: 0, y: 0 }
  }

  setProps(props) {
    if (props.x) this.schematic_position.x = props.x
    if (props.y) this.schematic_position.y = props.y
    if (props.dir) this.schematic_direction = props.dir
    if (props.direction) this.schematic_direction = props.direction

    for (const key of Object.keys(props).filter((k) =>
      settable_props.includes(k)
    )) {
      this[key] = props[key]
    }
    return this
  }

  setName(name) {
    this.name = name
    return this
  }

  setPinNumber(pin_number: number) {
    this.pin_number = pin_number
    return this
  }

  setSchematicPosition(point) {
    this.schematic_position = point
    return this
  }

  setSchematicDirection(direction) {
    this.schematic_direction = direction
    return this
  }

  build() {
    throw new Error(`"port_builder" must be built via "ports_builder"`)
    return []
  }
}

export const createPortBuilder = (
  project_builder: ProjectBuilder
): PortBuilder => {
  return new PortBuilderClass(project_builder)
}
