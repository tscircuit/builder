import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const M48 = defineExcellonDrillCommand({
  command_code: "M48",
  schema: z.object({
    command_code: z.literal("M48").default("M48"),
  }),
  stringify: () => "M48",
})
