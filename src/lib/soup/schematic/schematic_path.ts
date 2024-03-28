import { z } from "zod"
import { point } from "../common/point"

export const schematic_path = z.object({
  type: z.literal("schematic_path"),
  schematic_component_id: z.string(),
  fill_color: z.string().optional(),
  is_filled: z.boolean().optional(),
  position: point,
  points: z.array(point),
})

export type SchematicPath = z.infer<typeof schematic_path>
