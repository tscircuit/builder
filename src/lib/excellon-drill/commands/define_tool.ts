import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const define_tool = defineExcellonDrillCommand({
  command_code: "define_tool",
  schema: z.object({
    command_code: z.literal("define_tool").default("define_tool"),
    tool_number: z.number(),
    diameter: z.number(),
  }),
  stringify: (c) => `T${c.tool_number}C${c.diameter.toFixed(6)}`,
})
