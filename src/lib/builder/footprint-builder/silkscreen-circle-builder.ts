import type { SilkscreenCircleProps } from "@tscircuit/props"
import type { AnySoupElement, PcbSilkscreenCircle } from "@tscircuit/soup"
import type { BuildContext } from "lib/types"
import type { BuilderInterface } from "../builder-interface"

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
    const silkscreen_circle: PcbSilkscreenCircle = {
      type: "pcb_silkscreen_circle",
      layer: "top",
      pcb_component_id: bc.pcb_component_id,
      pcb_silkscreen_circle_id: bc.getId("pcb_silkscreen_circle"),
      radius: bc.convert(this.props.radius!),
      center: {
        x: bc.convert(this.props.pcbX),
        y: bc.convert(this.props.pcbY),
      },
    }
    return [silkscreen_circle]
  }
}

export const createSilkscreenCircleBuilder = () => {
  return new SilkscreenCircleBuilderClass()
}
