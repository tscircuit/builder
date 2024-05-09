import { AnySoupElement } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import { ProjectBuilder } from "../project-builder"
import { BuildContext } from "lib/types"

export interface NetBuilder extends BuilderInterface {
  builder_type: "net_builder"
  setProps(props: any): this
  build(bc: BuildContext): AnySoupElement[]
}

export class NetBuilderClass implements NetBuilder {
  builder_type = "net_builder" as const
  props: any

  setProps(props: any) {
    this.props = props
    return this
  }

  build(bc: BuildContext): AnySoupElement[] {
    return [
      {
        type: "source_net",
      },
    ]
  }
}

export const createNetBuilder = (project_builder: ProjectBuilder) => {
  return new NetBuilderClass()
}
