import type { FabricationNotePathProps } from "@tscircuit/props"
import {
  pcb_route_hints,
  type AnySoupElement,
  type PcbFabricationNotePath,
} from "@tscircuit/soup"
import type { BuildContext } from "lib/types"
import type { BuilderInterface } from "../builder-interface"

export interface FabricationNotePathBuilder extends BuilderInterface {
  builder_type: "fabrication_note_path_builder"
  setProps(props: FabricationNotePathProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class FabricationNotePathBuilderClass
  implements FabricationNotePathBuilder
{
  builder_type = "fabrication_note_path_builder" as const
  props: Partial<FabricationNotePathProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<FabricationNotePathProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    const fabrication_note_path: PcbFabricationNotePath = {
      type: "pcb_fabrication_note_path",
      layer: "top",
      pcb_component_id: bc.pcb_component_id,
      fabrication_note_path_id: bc.getId("fabrication_note_path"),
      route: pcb_route_hints.parse(this.props.route!),
      stroke_width: bc.convert(this.props.strokeWidth) ?? 0.1,
    }
    return [fabrication_note_path]
  }
}

export const createFabricationNotePathBuilder =
  (): FabricationNotePathBuilder => {
    return new FabricationNotePathBuilderClass()
  }
