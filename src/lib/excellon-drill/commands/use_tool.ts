import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const use_tool = defineExcellonDrillCommand({
  command_code: "use_tool",
  schema: z.object({
    command_code: z.literal("use_tool").default("use_tool"),
    tool_number: z.number(),
  }),
  stringify: (c) => `T${c.tool_number}`,
})
