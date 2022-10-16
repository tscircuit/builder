import * as Type from "lib/types"
import { ProjectBuilder } from "lib/project"

export interface PlatedHoleBuilder {
  builder_type: "plated_hole_builder"
  project_builder: ProjectBuilder
  setProps(props: Partial<Type.PCBPlatedHole>): PlatedHoleBuilder
  build(): Promise<Type.PCBPlatedHole[]>
}

export class PlatedHoleBuilderClass implements PlatedHoleBuilder {
  project_builder: ProjectBuilder
  builder_type = "plated_hole_builder" as const

  outer_diameter: number
  hole_diameter: number
  x: number
  y: number

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  setProps(props: Partial<Type.PCBPlatedHole>): PlatedHoleBuilder {
    for (const k in props) {
      this[k] = props[k]
    }
    return this
  }

  async build(): Promise<Type.PCBPlatedHole[]> {
    return [
      {
        type: "pcb_plated_hole",
        x: this.x,
        y: this.y,
        hole_diameter: this.hole_diameter,
        outer_diameter: this.outer_diameter,
      },
    ]
  }
}

export const createPlatedHoleBuilder = (project_builder: ProjectBuilder) => {
  return new PlatedHoleBuilderClass(project_builder)
}
