import { z } from "zod"
import { point } from "../soup/common/point"

export const manual_layout = z.object({
  pcb_positions: z
    .array(
      z.object({
        selector: z.string(),
        relative_to: z
          .string()
          .optional()
          .default("group_center")
          .describe("Can be a selector or 'group_center'"),
        center: point,
      })
    )
    .optional(),
})

export type ManualLayout = z.infer<typeof manual_layout>
export type ManualLayoutInput = z.input<typeof manual_layout>
