import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const move_operation = defineGerberCommand({
  command_code: "D02",
  schema: z
    .object({
      command_code: z.literal("D02"),
      x: z.number(),
      y: z.number(),
    })
    .describe(
      "Move operation: D02 moves the current point to the coordinate in the command. It does not create an object."
    ),
  stringify({ x, y, draw }) {
    return `X${x}Y${y}D02*`
  },
})
