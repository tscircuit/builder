import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"
import { getGerberCoordinateWithPadding } from "../stringify-gerber/get-gerber-coordinate-with-padding"

const circle_template = z.object({
  standard_template_code: z.literal("C").describe("circle"),
  diameter: z.number(),
  hole_diameter: z.number().optional(),
})

const rectangle_template = z.object({
  standard_template_code: z.literal("R").describe("rectangle"),
  x_size: z.number(),
  y_size: z.number(),
  hole_diameter: z.number().optional(),
})

const obround_template = z.object({
  standard_template_code: z.literal("O").describe("obround"),
  x_size: z.number(),
  y_size: z.number(),
  hole_diameter: z.number().optional(),
})

const polygon_template = z.object({
  standard_template_code: z.literal("P").describe("polygon"),
  outer_diameter: z.number(),
  number_of_vertices: z.number().int(),
  rotation: z.number().optional(),
  hole_diameter: z.number().optional(),
})

const aperture_template_config = z.discriminatedUnion(
  "standard_template_code",
  [circle_template, rectangle_template, obround_template, polygon_template]
)

export const define_aperture_template = defineGerberCommand({
  command_code: "ADD",
  schema: aperture_template_config.and(
    z.object({
      command_code: z.literal("ADD").default("ADD"),
      aperture_number: z.number().int(),
    })
  ),
  stringify(props) {
    const { aperture_number, standard_template_code } = props
    let commandString = `%ADD${aperture_number}${standard_template_code},`

    if (standard_template_code === "C") {
      commandString += `${props.diameter.toFixed(6)}`
    } else if (
      standard_template_code === "R" ||
      standard_template_code === "O"
    ) {
      commandString += `${props.x_size.toFixed(6)}X${props.y_size.toFixed(6)}`
    } else if (standard_template_code === "P") {
      commandString += `${props.outer_diameter}X${props.number_of_vertices}X${
        props.rotation ? `X${props.rotation}` : ""
      }`
    }

    if (props.hole_diameter) {
      commandString += `X${props.hole_diameter.toFixed(6)}`
    }

    commandString += "*%"

    return commandString
  },
})

export type DefineAperatureTemplateCommand = z.infer<
  typeof define_aperture_template.schema
>

export type ApertureTemplateConfig = z.infer<typeof aperture_template_config>
