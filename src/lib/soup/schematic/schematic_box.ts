import { z } from "zod"

export const schematic_box = z.object({
  type: z.literal("schematic_box"),
  schematic_component_id: z.string(),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
})

export type SchematicBox = z.infer<typeof schematic_box>
