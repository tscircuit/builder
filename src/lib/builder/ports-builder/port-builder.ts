import * as Type from "lib/types"
import { Dimension } from "lib/types"
import { ProjectBuilder } from "../project-builder"

export interface PortBuilder {
  builder_type: "port_builder"
  name: string
  schematic_position: { x: Dimension; y: Dimension }
  schematic_direction: "up" | "down" | "left" | "right"
  setName(name: string): PortBuilder
  setSchematicPosition(coords: { x: number; y: number }): PortBuilder
  setSchematicDirection(dir: "up" | "down" | "left" | "right"): PortBuilder
  build(): Type.AnyElement[]
}

export class PortBuilderClass implements PortBuilder {
  builder_type = "port_builder" as const
  project_builder: ProjectBuilder
  name: string = ""

  schematic_position: Type.Point = { x: 0, y: 0 }
  schematic_direction: "up" | "down" | "left" | "right"

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  setName(name) {
    this.name = name
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
