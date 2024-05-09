import { AnySoupElement } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import { ProjectBuilder } from "../project-builder"
import { BuildContext } from "lib/types"

export interface NetBuilder extends BuilderInterface {
  builder_type: "net_builder"
  build(bc: BuildContext): AnySoupElement[]
}

export class NetBuilderClass implements NetBuilder {
  builder_type: "net_builder"

  build(bc: BuildContext): AnySoupElement[] {
    throw new Error("Method not implemented.")
  }
}

export const createNetBuilder = (project_builder: ProjectBuilder) => {
  return new NetBuilderClass()
}
