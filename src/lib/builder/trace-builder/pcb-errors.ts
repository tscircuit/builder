import { PCBTraceError } from "@tscircuit/soup"
import type { TracePcbRoutingContext } from "./pcb-routing/trace-pcb-routing-context"

export const createNoCommonLayersError = (
  ctx: TracePcbRoutingContext
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

export const createNoLayersSpecifiedError = (
  ctx: TracePcbRoutingContext
): PCBTraceError => ({
  pcb_error_id: ctx.getId("pcb_error"),
  type: "pcb_error",
  error_type: "pcb_trace_error",
  message: `No layers specified for terminals`,
  pcb_trace_id: ctx.pcb_trace_id,
  source_trace_id: ctx.source_trace_id,
  pcb_component_ids: [], // TODO
  pcb_port_ids: ctx.pcb_terminal_port_ids,
})

export const createPcbTraceError = (
  msg: string,
  ctx: TracePcbRoutingContext
): PCBTraceError => ({
  pcb_error_id: "pcb_error",
  type: "pcb_error",
  error_type: "pcb_trace_error",
  message: msg,
  pcb_trace_id: ctx.pcb_trace_id,
  source_trace_id: ctx.source_trace_id,
  pcb_component_ids: [], // TODO
  pcb_port_ids: ctx.pcb_terminal_port_ids,
})
