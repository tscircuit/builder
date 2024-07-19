import type { LayerRef, PCBVia, PCBViaInput } from "@tscircuit/soup"
import type { ProjectBuilder } from "lib/project"
import type * as Type from "lib/types"
import type { BuildContext } from "lib/types/build-context"

export interface PcbViaBuilder {
  builder_type: "pcb_via_builder"
  project_builder: ProjectBuilder
  setProps(props: Omit<PCBViaInput, "type">): PcbViaBuilder
  build(bc: BuildContext): Promise<PCBVia[]>
}

export class PcbViaBuilderClass implements PcbViaBuilder {
  project_builder: ProjectBuilder
  builder_type = "pcb_via_builder" as const

  outer_diameter: Type.Dimension
  hole_diameter: Type.Dimension
  pcb_x: Type.Dimension
  pcb_y: Type.Dimension
  layers?: LayerRef[]
  port_hints: string[]

  constructor(project_builder: ProjectBuilder) {
    this.project_builder = project_builder
    this.port_hints = []
  }

  setProps(props: Partial<PCBViaInput>): PcbViaBuilder {
    const remap = {
      x: "pcb_x",
      y: "pcb_y",
    }
    for (const k in props) {
      this[remap[k] ?? k] = props[k]
    }
    return this
  }

  async build(bc: BuildContext): Promise<PCBVia[]> {
    return [
      {
        type: "pcb_via",
        x: bc.convert(this.pcb_x),
        y: bc.convert(this.pcb_y),
        hole_diameter: bc.convert(this.hole_diameter),
        outer_diameter: bc.convert(this.outer_diameter),
        layers: this.layers ?? bc.all_copper_layers,
        // legacy compat
        from_layer: this.layers?.[0],
        to_layer: this.layers?.[1],
      },
    ]
  }
}

export const createPcbViaBuilder = (
  project_builder: ProjectBuilder
): PcbViaBuilder => {
  return new PcbViaBuilderClass(project_builder)
}
