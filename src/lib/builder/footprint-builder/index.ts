import { BaseComponentBuilder, ProjectBuilder } from "lib/project"
import * as Type from "lib/types"

export type FootprintBuilderCallback = (rb: FootprintBuilder) => unknown
export interface FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder
  addPad(): FootprintBuilder
  build(): Promise<Type.AnyElement[]>
}

export class FootprintBuilderClass implements FootprintBuilder {
  builder_type: "footprint_builder"
  project_builder: ProjectBuilder

  smt_pads: Array<{}> = []

  addPad(): FootprintBuilder {
    throw new Error("Method not implemented.")
  }

  async build(): Promise<Type.AnyElement[]> {
    return [
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        layer: { name: "top" },
        // pcb_component_id?: string
        // pcb_port_id?: string
      } as Type.PCBSMTPad,
    ]
  }
}
