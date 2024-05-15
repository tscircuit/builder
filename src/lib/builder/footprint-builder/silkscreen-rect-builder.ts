import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenRect } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import type { SilkscreenRectProps } from "@tscircuit/props"

export interface SilkscreenRectBuilder extends BuilderInterface {
  builder_type: "silkscreen_rect_builder"
  setProps(props: SilkscreenRectProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenRectBuilderClass implements SilkscreenRectBuilder {
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
    const silkscreen_rect: PcbSilkscreenRect = {
      type: "pcb_silkscreen_rect",
      pcb_silkscreen_rect_id: bc.getId("pcb_silkscreen_rect"),
      center: {
        x: bc.convert(this.props.pcbX),
        y: bc.convert(this.props.pcbY),
      },
      width: bc.convert(this.props.width!),
      height: bc.convert(this.props.height!),
      layer: "top",
      pcb_component_id: bc.pcb_component_id,
    }
    return [silkscreen_rect]
  }
}

export const createSilkscreenRectBuilder = (): SilkscreenRectBuilder => {
  return new SilkscreenRectBuilderClass()
}
