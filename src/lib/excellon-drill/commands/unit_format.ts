import { z } from "zod"
import { defineExcellonDrillCommand } from "../define-excellon-drill-command"

export const unit_format = defineExcellonDrillCommand({
  command_code: "unit_format",
  schema: z.object({
    command_code: z.literal("unit_format").default("unit_format"),
    unit: z.union([z.literal("INCH"), z.literal("METRIC")]),
    lz: z
      .union([z.literal("LZ"), z.literal("TZ")])
      .nullable()
      .default(null),
  }),
  stringify(c) {
    return `${c.unit}${!c.lz ? "" : `,${c.lz}`}`
  },
})
