import * as Type from "lib/types"
import { ProjectBuilder } from "lib/project"
import {BuildContext} from "lib/types/build-context"

export interface PlatedHoleBuilder {
  builder_type: "plated_hole_builder"
  project_builder: ProjectBuilder
  setProps(props: Partial<Type.PCBPlatedHole>): PlatedHoleBuilder
  build(bc: BuildContext): Promise<Type.PCBPlatedHole[]>
}

export class PlatedHoleBuilderClass implements PlatedHoleBuilder {
  project_builder: ProjectBuilder
  builder_type = "plated_hole_builder" as const

  outer_diameter: Type.Dimension
  hole_diameter: Type.Dimension
  x: Type.Dimension
  y: Type.Dimension

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  setProps(props: Partial<{
    
  }>): PlatedHoleBuilder {
    for (const k in props) {
      this[k] = props[k]
    }
    return this
  }

  async build(bc): Promise<Type.PCBPlatedHole[]> {
    return [
      {
        type: "pcb_plated_hole",
        x: bc.convert(this.x),
        y: bc.convert(this.y),
        hole_diameter: bc.convert(this.hole_diameter),
        outer_diameter: bc.convert(this.outer_diameter),
      },
    ]
  }
}

export const createPlatedHoleBuilder = (project_builder: ProjectBuilder) => {
  return new PlatedHoleBuilderClass(project_builder)
}
