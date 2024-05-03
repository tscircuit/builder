import { z } from "zod"
import { point } from "../soup/common/point"

export const manual_layout = z.object({
  pcb_positions: z.array(
    z.object({
      selector: z.string(),
      center: point,
    })
  ),
})

export type ManualLayout = z.infer<typeof manual_layout>
export type ManualLayoutInput = z.input<typeof manual_layout>
