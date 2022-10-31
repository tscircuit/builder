import * as Type from "lib/types"
import { ProjectBuilder } from "lib/project"

export interface ViaBuilder {
  builder_type: "via_builder"
  project_builder: ProjectBuilder
  setProps(props: Partial<Type.PCBVia>): ViaBuilder
  build(bc: Type.BuildContext): Promise<Type.PCBVia[]>
}

export class ViaBuilderClass implements ViaBuilder {
  project_builder: ProjectBuilder
  builder_type = "via_builder" as const

  outer_diameter: Type.Dimension
  hole_diameter: Type.Dimension
  x: Type.Dimension
  y: Type.Dimension

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
  }

  setProps(props: Partial<Type.PCBVia>): ViaBuilder {
    for (const k in props) {
      this[k] = props[k]
    }
    return this
  }

  async build(bc): Promise<Type.PCBVia[]> {
    return [
      {
        type: "pcb_via",
        x: bc.convert(this.x),
        y: bc.convert(this.y),
        hole_diameter: bc.convert(this.hole_diameter),
        outer_diameter: bc.convert(this.outer_diameter),
      },
    ]
  }
}

export const createViaBuilder = (project_builder: ProjectBuilder) => {
  return new ViaBuilderClass(project_builder)
}
