import su from "@tscircuit/soup-util"
import { applySelector } from "lib/apply-selector"
import { AnySoupElement, LayerRef, RouteHintPoint } from "lib/soup"
import { BuildContext, Dimension } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { PcbTraceHint } from "lib/soup/pcb/pcb_trace_hint"
import { z } from "zod"
import { route_hint_point } from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"

const trace_hints_props = z.object({
  for: z.string(),
  order: z.number().optional(),
  offset: route_hint_point.optional(),
  offsets: z.array(route_hint_point).optional(),
})

type TraceHintProps = z.infer<typeof trace_hints_props>
type TraceHintPropsInput = z.input<typeof trace_hints_props>

export interface TraceHintBuilder extends BuilderInterface {
  setProps(new_props: Partial<TraceHintPropsInput>): this
  build(parent_elements: AnySoupElement[], bc: BuildContext): AnySoupElement[]
}

class TraceHintBuilderClass {
  builder_type: "trace_hint_builder" = "trace_hint_builder"
  props: Partial<TraceHintPropsInput>

  constructor() {
    this.props = {}
  }

  setProps(new_props: Partial<TraceHintPropsInput>) {
    if (this.props.order)
      throw new Error("The order props on <tracehint /> is not yet supported")
    this.props = {
      ...this.props,
      ...new_props,
    }
    return this
  }

  build(parent_elements: AnySoupElement[], bc: BuildContext): AnySoupElement[] {
    const props = trace_hints_props.parse(this.props)
    if (!props.for) {
      // TODO source error
      throw new Error("TraceHintBuilder requires a 'for' prop")
    }

    const target_elms = applySelector(parent_elements, props.for)

    if (target_elms.length === 0) {
      // TODO source error
      throw new Error(`No element found for selector: "${props.for}"`)
    }
    if (target_elms.length > 1) {
      // TODO source error
      throw new Error(`<tracehint /> does not yet support multiple selectors`)
    }

    const [target_elm] = target_elms

    if (target_elm.type !== "source_port") {
      throw new Error(
        "<tracehint /> currently only supports pcb_port elements, use a selector that targets a port"
      )
    }

    // Find associated pcb_port
    const pcb_port = su(parent_elements).pcb_port.getWhere({
      source_port_id: target_elm.source_port_id,
    })

    if (!pcb_port) {
      // TODO source error
      throw new Error(
        `No pcb_port found for source_port: "${target_elm.source_port_id}"/"${this.props.for}"`
      )
    }

    const route: RouteHintPoint[] = []

    // TODO offset isn't the only way to add to a route, support more modes in
    // the future
    const offsets =
      this.props.offsets ?? (this.props.offset ? [this.props.offset] : [])

    if (offsets.length > 0) {
      for (const offset_input of offsets) {
        const offset = route_hint_point.parse(offset_input)
        route.push({
          x: pcb_port.x + offset.x,
          y: pcb_port.y + offset.y,
          via: offset.via,
          to_layer: offset.to_layer,
        })
      }
    }

    if (route.length === 0) {
      // TODO source error
      throw new Error(`No route defined for tracehint (try adding an offset)`)
    }

    // Construct pcb_trace_hint
    const trace_hint: PcbTraceHint = {
      type: "pcb_trace_hint",
      pcb_port_id: pcb_port.pcb_port_id,
      pcb_component_id: pcb_port.pcb_component_id,
      route,
    }

    return [trace_hint]
  }
}

export const createTraceHintBuilder = (
  project_builder: ProjectBuilder
): TraceHintBuilder => {
  return new TraceHintBuilderClass()
}
