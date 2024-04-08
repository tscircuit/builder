import { z } from "zod"

export const set_movement_mode_to_clockwise_circular = z
  .object({
    command_code: z.literal("G02"),
    mode: z.string(),
  })
  .describe(
    "Set movement mode to clockwise circular: Sets linear/circular mode to clockwise circular."
  )

export type SetMovementModeToClockwiseCircular = z.infer<
  typeof set_movement_mode_to_clockwise_circular
>
