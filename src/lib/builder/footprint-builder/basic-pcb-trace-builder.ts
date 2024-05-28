import { BuildContext } from "lib/types"
import {
  AnySoupElement,
  PcbSilkscreenCircle,
  PcbSilkscreenPath,
  PCBTrace,
} from "@tscircuit/soup"
import type { BuilderInterface } from "../builder-interface"
import type { PcbTraceProps } from "@tscircuit/props"

export interface BasicPcbTraceBuilder extends BuilderInterface {
  builder_type: "basic_pcb_trace_builder"
  setProps(props: PcbTraceProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class BasicPcbTraceBuilderClass implements BasicPcbTraceBuilder {
  builder_type = "basic_pcb_trace_builder" as const
  props: Partial<PcbTraceProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<PcbTraceProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    const trace: PCBTrace = {
      type: "pcb_trace",
      pcb_trace_id: bc.getId("pcb_trace"),
      route:
        this.props.route?.map((rp): PCBTrace["route"][number] => {
          if (rp.via && "" in rp) {
            return {
              x: bc.convert(rp.x),
              y: bc.convert(rp.y),
              route_type: "via",
              to_layer: (rp.to_layer ?? this.props.layer ?? "top") as any,
              from_layer: (rp.to_layer ?? this.props.layer ?? "bottom") as any,
              // TODO to_layer and from_layer
            }
          } else {
            return {
              route_type: "wire",
              x: bc.convert(rp.x),
              y: bc.convert(rp.y),
              layer: (rp.to_layer ?? this.props.layer ?? "top") as any,
              width: bc.convert(this.props.thickness ?? 0.1), // TODO use bc.default_trace_width when it's available
            } as any
          }
        }) ?? [],
    }
    return [trace]
  }
}

export const createBasicPcbTraceBuilder = () => {
  return new BasicPcbTraceBuilderClass()
}
