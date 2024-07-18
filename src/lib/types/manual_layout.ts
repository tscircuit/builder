import { z } from "zod"
import { point } from "@tscircuit/soup"

export const manual_pcb_position = z.object({
  selector: z.string(),
  relative_to: z
    .string()
    .optional()
    .default("group_center")
    .describe("Can be a selector or 'group_center'"),
  center: point,
})

export const manual_layout = z.object({
  pcb_positions: z.array(manual_pcb_position).optional(),
})

export type ManualPcbPosition = z.infer<typeof manual_pcb_position>
export type ManualPcbPositionInput = z.input<typeof manual_pcb_position>

export type ManualLayout = z.infer<typeof manual_layout>
export type ManualLayoutInput = z.input<typeof manual_layout>
