import { AnySoupElement } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import { ProjectBuilder } from "../project-builder"
import { BuildContext } from "lib/types"

export type Props = {
  name: string
  is_analog_signal?: boolean
  is_digital_signal?: boolean
  is_power?: boolean
  is_ground?: boolean
}

export interface NetBuilder extends BuilderInterface {
  builder_type: "net_builder"
  setProps(props: Props): this
  build(bc: BuildContext): AnySoupElement[]
}

export class NetBuilderClass implements NetBuilder {
  builder_type = "net_builder" as const
  props: Partial<Props>

  constructor() {
    this.props = {}
  }

  setProps(props: Partial<Props>) {
    this.props = { ...this.props, ...props }
    return this
  }

  build(bc: BuildContext): AnySoupElement[] {
    if (!this.props.name) throw new Error("Net name is required")

    // TODO try to infer if this net is already in current contextual net scope,
    // you can pull registered nets from the build context. This means that
    // every usage of <net name="gnd" /> can be the same "source_net"

    // The schematic_net_label will be created inside the trace builder

    const source_net_id = bc.getId("net")
    return [
      {
        type: "source_net",
        member_source_group_ids: [],
        source_net_id,
        name: this.props.name!,
        is_analog_signal: this.props.is_analog_signal,
        is_digital_signal: this.props.is_digital_signal,
        is_power: this.props.is_power,
        is_ground: this.props.is_ground,
      },
    ]
  }
}

export const createNetBuilder = (project_builder: ProjectBuilder) => {
  return new NetBuilderClass()
}
