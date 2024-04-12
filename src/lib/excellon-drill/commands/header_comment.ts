import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const header_comment = defineExcellonDrillCommand({
  command_code: "header_comment",
  schema: z.object({
    command_code: z.literal("header_comment").default("header_comment"),
    text: z.string(),
  }),
  stringify({ text }) {
    return `; ${text}`
  },
})
