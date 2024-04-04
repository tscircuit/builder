import { z } from "zod"

export const pcb_component = z
  .object({
    type: z.literal("pcb_component"),
    pcb_component_id: z.string(),
    source_component_id: z.string(),
  })
  .describe("Defines a component on the PCB")

export type PCBComponentInput = z.input<typeof pcb_component>
export type PCBComponent = z.infer<typeof pcb_component>
