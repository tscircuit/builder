import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import type { SilkscreenLineProps } from "@tscircuit/props"

export interface SilkscreenLineBuilder extends BuilderInterface {
  builder_type: "silkscreen_line_builder"
  setProps(props: SilkscreenLineProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenLineBuilderClass implements SilkscreenLineBuilder {
  builder_type = "silkscreen_line_builder" as const
  props: Partial<SilkscreenLineProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenLineProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    throw new Error("Silkscreen lines are built inside the footprint builder")
    return []
  }
}

export const createSilkscreenLineBuilder = () => {
  return new SilkscreenLineBuilderClass()
}
