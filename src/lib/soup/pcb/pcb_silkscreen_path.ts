import { z } from "zod"

export const pcb_silkscreen_path = z.object({
  type: z.literal("pcb_silkscreen_path"),
  path: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  width: z.number(),
  layer: z.enum(["top", "bottom"]),
})
