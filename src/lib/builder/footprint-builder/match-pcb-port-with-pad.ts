import { PCBPlatedHole, PCBSMTPad } from "@tscircuit/soup"
import * as Type from "lib/types"

export const matchPcbPortWithPad = ({
  pcb_port,
  source_port,
  pads,
}: {
  pcb_port: Type.PCBPort
  source_port: Type.SourcePort
  pads: (PCBPlatedHole | PCBSMTPad)[]
}) => {
  for (const pad of pads) {
    const port_hints = pad.port_hints ?? []
    if (
      port_hints.includes(source_port.name) ||
      (source_port.pin_number != null &&
        port_hints.includes(source_port.pin_number.toString()))
    ) {
      return pad
    }
  }
  return null
}
