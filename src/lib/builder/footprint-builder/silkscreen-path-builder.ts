import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import { SilkscreenPathProps } from "@tscircuit/props"

export interface SilkscreenPathBuilder extends BuilderInterface {
  builder_type: "silkscreen_path_builder"
  setProps(props: SilkscreenPathProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenPathBuilderClass implements SilkscreenPathBuilder {
  builder_type = "silkscreen_path_builder" as const
  props: Partial<SilkscreenPathProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenPathProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    throw new Error("Silkscreen paths are built inside the footprint builder")
    return []
  }
}

export const createSilkscreenPathBuilder = () => {}
