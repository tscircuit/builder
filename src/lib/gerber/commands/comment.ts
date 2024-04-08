import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const comment = defineGerberCommand({
  command_code: "G04",
  schema: z
    .object({
      command_code: z.literal("G04").default("G04"),
      comment: z.string(),
    })
    .describe(
      "Comment: A human readable comment, does not affect the image. 4.1"
    ),
  stringify: (c) => {
    return `G04 ${c.comment}*`
  },
})

export type Comment = z.infer<typeof comment.schema>
