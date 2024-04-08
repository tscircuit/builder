import { z } from "zod"

export const aperture_block = z
  .object({
    command_code: z.literal("AB"),
    block: z.string(),
  })
  .describe(
    "Aperture block: Opens a block aperture statement and assigns its aperture number or closes a block aperture statement"
  )

export type ApertureBlock = z.infer<typeof aperture_block>
