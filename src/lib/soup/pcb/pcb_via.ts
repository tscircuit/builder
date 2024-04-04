import { z } from "zod"
import { distance } from "../units"
import { layer_ref } from "./layer_ref"

export const pcb_via = z
  .object({
    type: z.literal("pcb_via"),
    x: distance,
    y: distance,
    outer_diameter: distance,
    hole_diameter: distance,
    from_layer: layer_ref,
    to_layer: layer_ref,
  })
  .describe("Defines a via on the PCB")

export type PCBViaInput = z.input<typeof pcb_via>
export type PCBVia = z.infer<typeof pcb_via>
