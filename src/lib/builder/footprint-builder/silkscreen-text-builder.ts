import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenText } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import { SilkscreenTextProps } from "@tscircuit/props"

export interface SilkscreenTextBuilder extends BuilderInterface {
  builder_type: "silkscreen_path_builder"
  setProps(props: SilkscreenTextProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenTextBuilderClass implements SilkscreenTextBuilder {
  builder_type = "silkscreen_path_builder" as const
  props: Partial<SilkscreenTextProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenTextProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    throw new Error("Silkscreen text is built inside the footprint builder")
    return []
  }
}

export const createSilkscreenTextBuilder = () => {}
