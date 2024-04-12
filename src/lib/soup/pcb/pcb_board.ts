import { z } from "zod"
import { length } from "../units"

export const pcb_board = z
  .object({
    type: z.literal("pcb_board"),
    width: length,
    height: length,
    center_x: length,
    center_y: length,
  })
  .describe("Defines the board outline of the PCB")

export type PCBBoardInput = z.input<typeof pcb_board>
export type PCBBoard = z.infer<typeof pcb_board>
