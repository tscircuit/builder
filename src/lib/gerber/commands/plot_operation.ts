import { z } from "zod"

export const plot_operation = z
  .object({
    command_code: z.literal("D01"),
    operation: z.string(),
  })
  .describe(
    "Plot operation: Outside a region statement D01 creates a draw or arc object with the current aperture. Inside it adds a draw/arc segment to the contour under construction. The current point is moved to draw/arc end point after the creation of the draw/arc."
  )

export type PlotOperation = z.infer<typeof plot_operation>
