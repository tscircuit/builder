import { AnySoupElement } from "lib/soup"
import { AnyZodObject, z, ZodObject, ZodUnion } from "zod"

export interface ExcellonDrillCommandDef<
  K extends string,
  T extends AnyZodObject | z.ZodIntersection<any, any>
> {
  command_code: K
  schema: T
  stringify: (c: z.infer<T>) => string
}

export const defineExcellonDrillCommand = <
  K extends string,
  T extends AnyZodObject | z.ZodIntersection<any, any>
>({
  command_code,
  schema,
  stringify,
}: {
  command_code: K
  schema: T
  stringify: (c: z.infer<T>) => string
}): ExcellonDrillCommandDef<K, T> => {
  return {
    command_code,
    schema,
    stringify,
  }
}

export const M48 = defineExcellonDrillCommand({
  command_code: "M48",
  schema: z.object({
    command_code: z.literal("M48").default("M48"),
  }),
  stringify: () => "M48",
})

export const M95 = defineExcellonDrillCommand({
  command_code: "M95",
  schema: z.object({
    command_code: z.literal("M95").default("M95"),
  }),
  stringify: () => "M95",
})

export const FMAT = defineExcellonDrillCommand({
  command_code: "FMAT",
  schema: z.object({
    command_code: z.literal("FMAT").default("FMAT"),
    format: z.number(),
  }),
  stringify: (c) => `FMAT,${c.format}`,
})

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

export const T = defineExcellonDrillCommand({
  command_code: "T",
  schema: z.object({
    command_code: z.literal("T").default("T"),
    tool_number: z.number(),
    diameter: z.number(),
  }),
  stringify: (c) => `T${c.tool_number}C${c.diameter}`,
})

export const define_tool = defineExcellonDrillCommand({
  command_code: "define_tool",
  schema: z.object({
    command_code: z.literal("define_tool").default("define_tool"),
    tool_number: z.number(),
    diameter: z.number(),
  }),
  stringify: (c) => `T${c.tool_number}C${c.diameter}`,
})

export const use_tool = defineExcellonDrillCommand({
  command_code: "use_tool",
  schema: z.object({
    command_code: z.literal("use_tool").default("use_tool"),
    tool_number: z.number(),
  }),
  stringify: (c) => `T${c.tool_number}`,
})

export const G90 = defineExcellonDrillCommand({
  command_code: "G90",
  schema: z.object({
    command_code: z.literal("G90").default("G90"),
  }),
  stringify: () => "G90",
})

export const G05 = defineExcellonDrillCommand({
  command_code: "G05",
  schema: z.object({
    command_code: z.literal("G05").default("G05"),
  }),
  stringify: () => "G05",
})

export const M30 = defineExcellonDrillCommand({
  command_code: "M30",
  schema: z.object({
    command_code: z.literal("M30").default("M30"),
  }),
  stringify: () => "M30",
})

export const drill_at = defineExcellonDrillCommand({
  command_code: "drill_at",
  schema: z.object({
    command_code: z.literal("drill_at").default("drill_at"),
    x: z.number(),
    y: z.number(),
  }),
  stringify: (c) => `X${c.x.toFixed(4)}Y${c.y.toFixed(4)}`,
})

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

export const header_attribute = defineExcellonDrillCommand({
  command_code: "header_attribute",
  schema: z.object({
    command_code: z.literal("header_attribute").default("header_attribute"),
    attribute_name: z.string(),
    attribute_value: z.string(),
  }),
  stringify({ attribute_name, attribute_value }) {
    return `; #@! ${attribute_name},${attribute_value}`
  },
})

export const rewind = defineExcellonDrillCommand({
  command_code: "rewind",
  schema: z.object({
    command_code: z.literal("rewind").default("rewind"),
  }),
  stringify: () => "%",
})

export const excellon_drill_command_map = {
  M48,
  M95,
  FMAT,
  unit_format,
  T,
  define_tool,
  use_tool,
  G90,
  G05,
  M30,
  drill_at,
  header_comment,
  header_attribute,
  rewind,
} satisfies Record<string, ExcellonDrillCommandDef<string, any>>

export type AnyExcellonDrillCommand = z.infer<
  (typeof excellon_drill_command_map)[keyof typeof excellon_drill_command_map]["schema"]
>

class ExcellonDrillBuilder {
  commands: Array<AnyExcellonDrillCommand>

  constructor() {
    this.commands = []
  }

  add<T extends keyof typeof excellon_drill_command_map>(
    cmd: T,
    props: z.input<(typeof excellon_drill_command_map)[T]["schema"]>
  ): ExcellonDrillBuilder {
    this.commands.push({
      ...({
        command_code: excellon_drill_command_map[cmd].command_code,
      } as any),
      ...props,
    })
    return this
  }

  build(): Array<AnyExcellonDrillCommand> {
    return this.commands
  }
}

export const excellonDrill = () => new ExcellonDrillBuilder()

export const stringifyExcellonDrill = (
  commands: Array<AnyExcellonDrillCommand>
) => {
  return commands
    .map((c) => {
      const def = excellon_drill_command_map[c.command_code]
      return def.stringify(c as any)
    })
    .join("\n")
}

export const mmToInch = (mm: number) => {
  return mm / 25.4
}

export const convertSoupToExcellonDrillCommands = ({
  soup,
  is_plated,
}: {
  soup: Array<AnySoupElement>
  is_plated: boolean
}): Array<AnyExcellonDrillCommand> => {
  const builder = excellonDrill()

  // Start sequence commands
  builder.add("M48", {})

  // Add header comments
  const date_str = new Date().toISOString()
  builder
    .add("header_comment", {
      text: `DRILL file {tscircuit} date ${date_str}`,
    })
    .add("header_comment", {
      text: "FORMAT={-:-/ absolute / inch / decimal}",
    })
    .add("header_attribute", {
      attribute_name: "TF.CreationDate",
      attribute_value: date_str,
    })
    .add("header_attribute", {
      attribute_name: "TF.GenerationSoftware",
      attribute_value: "tscircuit",
    })
    .add("header_attribute", {
      attribute_name: "TF.FileFunction",
      attribute_value: "Plated,1,2,PTH",
    })
    .add("FMAT", { format: 2 }) // Assuming format 2 for the example
    .add("unit_format", { unit: "INCH", lz: null })

  let tool_counter = 10 // Start tool numbering from 10 for example

  const diameterToToolNumber: Record<number, number> = {}

  // Define tools
  for (const element of soup) {
    if (element.type === "pcb_plated_hole" || element.type === "pcb_hole") {
      if (!diameterToToolNumber[element.hole_diameter]) {
        builder.add("define_tool", {
          tool_number: tool_counter,
          diameter: mmToInch(element.hole_diameter),
        })
        diameterToToolNumber[element.hole_diameter] = tool_counter
        tool_counter++
      }
    }
  }

  // Execute drills for tool N
  for (let i = 10; i < tool_counter; i++) {
    builder.add("use_tool", { tool_number: i })
    for (const element of soup) {
      if (element.type === "pcb_plated_hole" || element.type === "pcb_hole") {
        if (is_plated && element.type === "pcb_hole") continue
        if (!is_plated && element.type === "pcb_plated_hole") continue
        if (diameterToToolNumber[element.hole_diameter] === i) {
          builder.add("drill_at", {
            x: mmToInch(element.x),
            y: mmToInch(element.y),
          })
        }
      }
    }
  }

  builder.add("M30", {})

  return builder.build()
}
