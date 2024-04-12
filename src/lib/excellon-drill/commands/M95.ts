import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const M95 = defineExcellonDrillCommand({
  command_code: "M95",
  schema: z.object({
    command_code: z.literal("M95").default("M95"),
  }),
  stringify: () => "M95",
})
