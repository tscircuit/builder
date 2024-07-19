import type { PCBHole } from "@tscircuit/soup"
import type { ProjectBuilder } from "lib/project"

export interface HoleBuilder {
  builder_type: "hole_builder"
  project_builder: ProjectBuilder
  setProps(props: Partial<PCBHole>): HoleBuilder
  build(): Promise<PCBHole[]>
}

export class HoleBuilderClass implements HoleBuilder {
  project_builder: ProjectBuilder
  builder_type = "hole_builder" as const

  hole_diameter: number
  x: number
  y: number

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  setProps(props: Partial<PCBHole>): HoleBuilder {
    for (const k in props) {
      this[k] = props[k]
    }
    return this
  }

  async build(): Promise<PCBHole[]> {
    return [
      {
        type: "pcb_hole",
        x: this.x,
        y: this.y,
        hole_diameter: this.hole_diameter,
        hole_shape: "round",
      },
    ]
  }
}

export const createHoleBuilder = (project_builder: ProjectBuilder) => {
  return new HoleBuilderClass(project_builder)
}
