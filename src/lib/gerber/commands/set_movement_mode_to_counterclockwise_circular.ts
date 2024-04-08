import { z } from "zod"

export const set_movement_mode_to_counterclockwise_circular = z
  .object({
    command_code: z.literal("G03"),
    mode: z.string(),
  })
  .describe(
    "Set movement mode to counterclockwise circular: Sets linear/circular mode to counterclockwise circular."
  )

export type SetMovementModeToCounterclockwiseCircular = z.infer<
  typeof set_movement_mode_to_counterclockwise_circular
>
