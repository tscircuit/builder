import { z } from "zod"

export const load_rotation = z
  .object({
    command_code: z.literal("LR"),
    rotation: z.string(),
  })
  .describe(
    "Load rotation: Loads the rotation object transformation parameter."
  )

export type LoadRotation = z.infer<typeof load_rotation>
