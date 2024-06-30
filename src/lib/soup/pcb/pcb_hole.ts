import { z } from "zod"
import { distance } from "../units"

/** @deprecated use @tscircuit/soup module */
export const pcb_hole = z
  .object({
    type: z.literal("pcb_hole"),
    hole_diameter: z.number(),
    x: distance,
    y: distance,
  })
  .describe("Defines a hole on the PCB")

/** @deprecated use @tscircuit/soup module */
export type PCBHoleInput = z.input<typeof pcb_hole>
/** @deprecated use @tscircuit/soup module */
export type PCBHole = z.infer<typeof pcb_hole>
