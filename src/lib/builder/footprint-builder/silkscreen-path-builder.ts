import { BuildContext } from "lib/types"
import {
  AnySoupElement,
  pcb_route_hints,
  PcbSilkscreenPath,
} from "@tscircuit/soup"
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
    const silkscreen_path: PcbSilkscreenPath = {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: bc.pcb_component_id,
      pcb_silkscreen_path_id: bc.getId("pcb_silkscreen_path"),
      route: pcb_route_hints.parse(this.props.route!),
      stroke_width: bc.convert(this.props.strokeWidth) ?? 0.1,
    }
    return [silkscreen_path]
  }
}

export const createSilkscreenPathBuilder = (): SilkscreenPathBuilder => {
  return new SilkscreenPathBuilderClass()
}
