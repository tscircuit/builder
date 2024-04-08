import { z } from "zod"
import { defineGerberCommand } from "../GerberCommandDef"

const schema = z
  .object({
    command_code: z.literal("G04"),
    comment: z.string(),
  })
  .describe("Comment: A human readable comment, does not affect the image. 4.1")

export const comment = defineGerberCommand({
  schema,
  stringify: (c) => {
    return `G04 ${c.comment}*`
  },
})

export type Comment = z.infer<typeof comment.schema>
