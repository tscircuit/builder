import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import type { SilkscreenCircleProps } from "@tscircuit/props"

export interface SilkscreenCircleBuilder extends BuilderInterface {
  builder_type: "silkscreen_circle_builder"
  setProps(props: SilkscreenCircleProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenCircleBuilderClass implements SilkscreenCircleBuilder {
  builder_type = "silkscreen_circle_builder" as const
  props: Partial<SilkscreenCircleProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenCircleProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    throw new Error("Silkscreen rects are built inside the footprint builder")
    return []
  }
}

export const createSilkscreenCircleBuilder = () => {
  return new SilkscreenCircleBuilderClass()
}
