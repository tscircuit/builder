import { z } from "zod"

export const move_operation = z
  .object({
    command_code: z.literal("D02"),
    coordinates: z.string(),
  })
  .describe(
    "Move operation: D02 moves the current point to the coordinate in the command. It does not create an object."
  )

export type MoveOperation = z.infer<typeof move_operation>
