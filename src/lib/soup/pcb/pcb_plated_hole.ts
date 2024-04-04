import { z } from "zod"
import { distance } from "../units"

export const pcb_plated_hole = z
  .object({
    type: z.literal("pcb_plated_hole"),
    outer_diameter: z.number(),
    hole_diameter: z.number(),
    x: distance,
    y: distance,
    port_hints: z.array(z.string()).optional(),
    pcb_component_id: z.string().optional(),
    pcb_port_id: z.string().optional(),
  })
  .describe("Defines a plated hole on the PCB")

export type PCBPlatedHoleInput = z.input<typeof pcb_plated_hole>
export type PCBPlatedHole = z.infer<typeof pcb_plated_hole>
