import { getGerberCoordinateWithPadding } from "./../stringify-gerber/get-gerber-coordinate-with-padding"
import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const move_operation = defineGerberCommand({
  command_code: "D02",
  schema: z
    .object({
      command_code: z.literal("D02").default("D02"),
      x: z.number(),
      y: z.number(),
    })
    .describe(
      "Move operation: D02 moves the current point to the coordinate in the command. It does not create an object."
    ),
  stringify({ x, y }) {
    const [gx, gy] = [x, y].map((coord) =>
      getGerberCoordinateWithPadding(coord)
    )
    return `X${gx}Y${gy}D02*`
  },
})
