import { PCBPlatedHole } from "@tscircuit/soup"
import { ProjectBuilder } from "lib/project"
import * as Type from "lib/types"
import { BuildContext } from "lib/types/build-context"

export interface PlatedHoleBuilder {
  builder_type: "plated_hole_builder"
  project_builder: ProjectBuilder
  setProps(
    props: Partial<
      Omit<
        PCBPlatedHole,
        | "x"
        | "y"
        | "outer_width"
        | "outer_height"
        | "hole_width"
        | "hole_height"
        | "shape"
      > & {
        outer_diameter?: Type.Dimension
        outer_width?: Type.Dimension
        outer_height?: Type.Dimension
        hole_diameter?: Type.Dimension
        hole_width?: Type.Dimension
        hole_height?: Type.Dimension
        x: Type.Dimension
        y: Type.Dimension
        shape: "circle" | "oval" | "pill"
      }
    >
  ): PlatedHoleBuilder
  build(bc: BuildContext): Promise<PCBPlatedHole[]>
}

export class PlatedHoleBuilderClass implements PlatedHoleBuilder {
  project_builder: ProjectBuilder
  builder_type = "plated_hole_builder" as const

  outer_diameter?: Type.Dimension
  outer_width?: Type.Dimension
  outer_height?: Type.Dimension
  hole_diameter?: Type.Dimension
  hole_width?: Type.Dimension
  hole_height?: Type.Dimension
  x: Type.Dimension
  y: Type.Dimension
  shape: "circle" | "oval" | "pill"
  port_hints: string[]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.port_hints = []
  }

  setProps(props: Partial<{}>): PlatedHoleBuilder {
    for (const k in props) {
      this[k] = props[k]
    }
    return this
  }

  async build(bc: BuildContext): Promise<PCBPlatedHole[]> {
    if (this.shape === "circle") {
      return [
        {
          type: "pcb_plated_hole",
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          layers: bc.all_copper_layers,
          hole_diameter: bc.convert(Number(this.hole_diameter)),
          shape: "circle",
          outer_diameter: bc.convert(Number(this.outer_diameter)),
          port_hints: this.port_hints,
        },
      ]
    } else {
      return [
        {
          type: "pcb_plated_hole",
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          layers: bc.all_copper_layers,
          outer_width: bc.convert(Number(this.outer_width)),
          outer_height: bc.convert(Number(this.outer_height)),
          hole_width: bc.convert(Number(this.hole_width)),
          hole_height: bc.convert(Number(this.hole_height)),
          shape: this.shape,
          port_hints: this.port_hints,
        },
      ]
    }
  }
}

export const createPlatedHoleBuilder = (
  project_builder: ProjectBuilder
): PlatedHoleBuilder => {
  return new PlatedHoleBuilderClass(project_builder)
}
