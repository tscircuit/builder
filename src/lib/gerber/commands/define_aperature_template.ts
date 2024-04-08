import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const define_aperature_template = defineGerberCommand({
  command_code: "ADD",
  schema: z.intersection(
    z.object({
      command_code: z.literal("ADD").default("ADD"),
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
  stringify() {
    const {
      command_code,
      standard_template_code,
      diameter,
      x_size,
      y_size,
      outer_diameter,
      number_of_vertices,
      rotation,
      hole_diameter,
    } = this

    let commandString = `%${command_code}${standard_template_code}`

    if (standard_template_code === "C") {
      commandString += `${diameter}`
    } else if (
      standard_template_code === "R" ||
      standard_template_code === "O"
    ) {
      commandString += `${x_size}X${y_size}`
    } else if (standard_template_code === "P") {
      commandString += `${outer_diameter}${number_of_vertices}${
        rotation ? `R${rotation}` : ""
      }`
    }

    if (hole_diameter) {
      commandString += `X${hole_diameter}`
    }

    return commandString
  },
})
