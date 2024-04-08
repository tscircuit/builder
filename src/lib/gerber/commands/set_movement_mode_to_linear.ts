import { z } from "zod"

export const set_movement_mode_to_linear = z
  .object({
    command_code: z.literal("G01"),
    mode: z.string(),
  })
  .describe("Set movement mode to linear: Sets linear/circular mode to linear.")

export type SetMovementModeToLinear = z.infer<
  typeof set_movement_mode_to_linear
>
