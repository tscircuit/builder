import { z } from "zod"
import * as pcb from "./pcb"
import * as sch from "./schematic"
import * as src from "./source"

export const any_soup_element = z.union([
  // TODO source_group
  // TODO source_config
  // TODO pcb_group
  // TODO pcb_config
  // TODO schematic_config
  // TODO schematic_group
  src.source_trace,
  src.source_port,
  src.any_source_component,
  pcb.pcb_component,
  pcb.pcb_hole,
  pcb.pcb_plated_hole,
  pcb.pcb_port,
  pcb.pcb_text,
  pcb.pcb_trace,
  pcb.pcb_via,
  pcb.pcb_smtpad,
  pcb.pcb_board,
  pcb.pcb_trace_error,
  pcb.pcb_placement_error,
  pcb.pcb_port_not_matched_error,
  sch.schematic_box,
  sch.schematic_text,
  sch.schematic_line,
  sch.schematic_component,
  sch.schematic_port,
  sch.schematic_trace,
  sch.schematic_path,
])

export type AnySoupElement = z.infer<typeof any_soup_element>
export type AnySoupElementInput = z.input<typeof any_soup_element>
