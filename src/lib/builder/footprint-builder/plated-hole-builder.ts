import { PlatedHoleProps } from "@tscircuit/props"
import { PCBPlatedHole } from "@tscircuit/soup"
import { ProjectBuilder } from "lib/project"
import * as Type from "lib/types"
import { BuildContext } from "lib/types/build-context"
import { remapProp } from "../component-builder/remap-prop"

export interface PlatedHoleBuilder {
  builder_type: "plated_hole_builder"
  project_builder: ProjectBuilder
  setProps(
    props:
      | Partial<
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
      | Partial<PlatedHoleProps>
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
      const [new_key, new_val] = remapProp(k, props[k])
      this[new_key] = new_val
    }
    return this
  }

  async build(bc: BuildContext): Promise<PCBPlatedHole[]> {
    if (this.shape === "circle" || (!this.shape && this.outer_diameter)) {
      return [
        {
          type: "pcb_plated_hole",
          x: bc.convert(this.x),
          y: bc.convert(this.y),
          layers: bc.all_copper_layers,
          hole_diameter: bc.convert(this.hole_diameter!),
          shape: "circle",
          outer_diameter: bc.convert(this.outer_diameter!),
          port_hints: this.port_hints,
        },
      ]
    }
    return [
      {
        type: "pcb_plated_hole",
        x: bc.convert(this.x),
        y: bc.convert(this.y),
        layers: bc.all_copper_layers,
        outer_width: bc.convert(this.outer_width!),
        outer_height: bc.convert(this.outer_height!),
        hole_width: bc.convert(this.hole_width ?? this.hole_diameter!),
        hole_height: bc.convert(this.hole_height ?? this.hole_diameter!),
        shape: this.shape,
        port_hints: this.port_hints,
      },
    ]
  }
}

export const createPlatedHoleBuilder = (
  project_builder: ProjectBuilder
): PlatedHoleBuilder => {
  return new PlatedHoleBuilderClass(project_builder)
}
