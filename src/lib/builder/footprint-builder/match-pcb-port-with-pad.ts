import type {
  PCBPlatedHole,
  PCBPort,
  PCBSMTPad,
  SourcePort,
} from "@tscircuit/soup"

export const matchPcbPortWithPad = ({
  pcb_port,
  source_port,
  pads,
}: {
  pcb_port: PCBPort
  source_port: SourcePort
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
