import { BuildContext } from "lib/types"
import { AnySoupElement, PcbSilkscreenText } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import { SilkscreenTextProps } from "@tscircuit/props"

export interface SilkscreenTextBuilder extends BuilderInterface {
  builder_type: "silkscreen_text_builder"
  setProps(props: SilkscreenTextProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenTextBuilderClass implements SilkscreenTextBuilder {
  builder_type = "silkscreen_text_builder" as const
  props: Partial<SilkscreenTextProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenTextProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    const silkscreen_text: PcbSilkscreenText = {
      type: "pcb_silkscreen_text",
      layer: this.props.layer as any,
      font: this.props.font ?? "tscircuit2024",
      font_size: bc.convert(this.props.fontSize) ?? 0.2,
      pcb_component_id: bc.pcb_component_id,
      anchor_position: {
        x: bc.convert(this.props.pcbX),
        y: bc.convert(this.props.pcbY),
      },
      anchor_alignment: this.props.anchorAlignment ?? "center",
      text: this.props.text!,
    }
    return [silkscreen_text]
  }
}

export const createSilkscreenTextBuilder = (): SilkscreenTextBuilder => {
  return new SilkscreenTextBuilderClass()
}
