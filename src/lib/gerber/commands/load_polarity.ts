import { z } from "zod"

export const load_polarity = z
  .object({
    command_code: z.literal("LP"),
    polarity: z.string(),
  })
  .describe(
    "Load polarity: Loads the polarity object transformation parameter."
  )

export type LoadPolarity = z.infer<typeof load_polarity>
