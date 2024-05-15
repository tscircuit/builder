import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenPath } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import type { SilkscreenRectProps } from "@tscircuit/props"

export interface SilkscreenLineBuilder extends BuilderInterface {
  builder_type: "silkscreen_rect_builder"
  setProps(props: SilkscreenRectProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenRectBuilderClass implements SilkscreenLineBuilder {
  builder_type = "silkscreen_rect_builder" as const
  props: Partial<SilkscreenRectProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenRectProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    throw new Error("Silkscreen rects are built inside the footprint builder")
    return []
  }
}

export const createSilkscreenRectBuilder = () => {
  return new SilkscreenRectBuilderClass()
}
