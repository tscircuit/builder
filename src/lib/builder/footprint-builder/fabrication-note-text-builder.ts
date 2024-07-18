import type { FabricationNoteTextProps } from "@tscircuit/props"
import type { AnySoupElement, PcbFabricationNoteText } from "@tscircuit/soup"
import type { BuildContext } from "lib/types"
import type { BuilderInterface } from "../builder-interface"

export interface FabricationNoteTextBuilder extends BuilderInterface {
  builder_type: "fabrication_note_text_builder"
  setProps(props: FabricationNoteTextProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class FabricationNoteTextBuilderClass
  implements FabricationNoteTextBuilder
{
  builder_type = "fabrication_note_text_builder" as const
  props: Partial<FabricationNoteTextProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<FabricationNoteTextProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    const fabrication_note_text: PcbFabricationNoteText = {
      type: "pcb_fabrication_note_text",
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
    return [fabrication_note_text]
  }
}

export const createFabricationNoteTextBuilder =
  (): FabricationNoteTextBuilder => {
    return new FabricationNoteTextBuilderClass()
  }
