import { PCBTraceError } from "@tscircuit/soup"
import type { PcbRoutingContext } from "./pcb-routing/pcb-routing-context"

export const createNoCommonLayersError = (
  ctx: PcbRoutingContext
): PCBTraceError => ({
  pcb_error_id: ctx.getId("pcb_error"),
  type: "pcb_error",
  error_type: "pcb_trace_error",
  message: `No common layers could be resolved for terminals`,
  pcb_trace_id: ctx.pcb_trace_id,
  source_trace_id: ctx.source_trace_id,
  pcb_component_ids: [], // TODO
  pcb_port_ids: ctx.pcb_terminal_port_ids,
})
