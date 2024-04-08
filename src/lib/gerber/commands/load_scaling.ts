import { z } from "zod"

export const load_scaling = z
  .object({
    command_code: z.literal("LS"),
    scaling: z.string(),
  })
  .describe("Load scaling: Loads the scale object transformation parameter.")

export type LoadScaling = z.infer<typeof load_scaling>
