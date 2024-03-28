import { z } from "zod"
import { point } from "../common/point"
import { size } from "../common/size"
import { rotation } from "../units"

// {
//   type: "schematic_line"
//   schematic_component_id: string
//   x1: number
//   x2: number
//   y1: number
//   y2: number
// }

export const schematic_line = z.object({
  type: z.literal("schematic_line"),
  schematic_component_id: z.string(),
  x1: z.number(),
  x2: z.number(),
  y1: z.number(),
  y2: z.number(),
})
