import { z } from "zod"

export const step_and_repeat = z
  .object({
    command_code: z.literal("SR"),
    statement: z.string(),
  })
  .describe("Step and repeat: Open or closes a step and repeat statement.")

export type StepAndRepeat = z.infer<typeof step_and_repeat>
