import { z } from "zod"

export const comment = z
  .object({
    command_code: z.literal("G04"),
    comment: z.string(),
  })
  .describe("Comment: A human readable comment, does not affect the image. 4.1")
export type Comment = z.infer<typeof comment>
