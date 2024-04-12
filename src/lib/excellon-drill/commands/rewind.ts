import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const rewind = defineExcellonDrillCommand({
  command_code: "rewind",
  schema: z.object({
    command_code: z.literal("rewind").default("rewind"),
  }),
  stringify: () => "%",
})
