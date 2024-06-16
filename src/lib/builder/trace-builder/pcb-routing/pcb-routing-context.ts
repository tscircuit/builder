import { AnySoupElement, PCBTraceError } from "@tscircuit/soup"
import { BuildContext } from "lib/types"
import { PcbObstacle } from "./get-pcb-obstacles"

export type PcbRoutingContext = {
  mutable_pcb_errors: PCBTraceError[]
  source_trace_id: string
  pcb_trace_id: string
  pcb_terminal_port_ids: string[]
  thickness_mm: number
  elements: AnySoupElement[]
  pcb_obstacles: PcbObstacle[]
} & BuildContext
