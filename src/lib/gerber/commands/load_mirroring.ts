import { z } from "zod"

export const load_mirroring = z
  .object({
    command_code: z.literal("LM"),
    mirroring: z.string(),
  })
  .describe("Load mirroring: Loads the mirror object transformation parameter.")

export type LoadMirroring = z.infer<typeof load_mirroring>
