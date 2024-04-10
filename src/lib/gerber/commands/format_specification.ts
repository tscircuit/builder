import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const format_specification = defineGerberCommand({
  command_code: "FS",
  schema: z.object({
    command_code: z.literal("FS").default("FS"),
    zero_omission_mode: z
      .union([z.literal("L").describe("leading zeros omitted"), z.literal("T")])
      .nullable()
      .default(null),
    coordinate_notation: z
      .union([
        z.literal("A").describe("absolute notation"),
        z.literal("I").describe("incremental notation"),
      ])
      .default("A"),
    x_integer_digits: z.number().int().default(4),
    x_decimal_digits: z.number().int().default(6),
    y_integer_digits: z.number().int().default(4),
    y_decimal_digits: z.number().int().default(6),
  }),
  stringify: () => {
    return "%FSLAX46Y46*%"
  },
})

export type FormatSpecification = z.infer<typeof format_specification.schema>
