import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const define_aperture_template = defineGerberCommand({
  command_code: "ADD",
  schema: z.intersection(
    z.object({
      command_code: z.literal("ADD").default("ADD"),
      aperture_number: z.number().int(),
    }),
    z.union([
      z.object({
        standard_template_code: z.literal("C").describe("circle"),
        diameter: z.number(),
        hole_diameter: z.number().optional(),
      }),
      z.object({
        standard_template_code: z.literal("R").describe("rectangle"),
        x_size: z.number(),
        y_size: z.number(),
        hole_diameter: z.number().optional(),
      }),
      z.object({
        standard_template_code: z.literal("O").describe("Obround"),
        x_size: z.number(),
        y_size: z.number(),
        hole_diameter: z.number().optional(),
      }),
      z.object({
        standard_template_code: z.literal("P").describe("polygon"),
        outer_diameter: z.number(),
        number_of_vertices: z.number().int(),
        rotation: z.number().optional(),
        hole_diameter: z.number().optional(),
      }),
    ])
  ),
  stringify(props) {
    const { aperture_number, standard_template_code } = props
    let commandString = `%ADD${aperture_number}${standard_template_code},`

    if (standard_template_code === "C") {
      commandString += `${props.diameter}`
    } else if (
      standard_template_code === "R" ||
      standard_template_code === "O"
    ) {
      commandString += `${props.x_size}X${props.y_size}`
    } else if (standard_template_code === "P") {
      commandString += `${props.outer_diameter}${props.number_of_vertices}${
        props.rotation ? `R${props.rotation}` : ""
      }`
    }

    if (props.hole_diameter) {
      commandString += `X${props.hole_diameter}`
    }

    return commandString
  },
})
