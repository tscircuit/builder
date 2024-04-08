import { z } from "zod"
import { defineGerberCommand } from "../define-gerber-command"

export const plot_operation = defineGerberCommand({
  command_code: "D01",
  schema: z
    .object({
      command_code: z.literal("D01"),
      x: z.number(),
      y: z.number(),
    })
    .describe(
      "Plot operation: Outside a region statement D01 creates a draw or arc object with the current aperture. Inside it adds a draw/arc segment to the contour under construction. The current point is moved to draw/arc end point after the creation of the draw/arc."
    ),
  stringify({ x, y }) {
    return `X${x}Y${y}D01*`
  },
})
