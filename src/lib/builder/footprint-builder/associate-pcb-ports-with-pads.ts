import * as Type from "lib/types"
import { all_layers } from "lib/soup/pcb/properties/layer_ref"
import { matchPcbPortWithPad } from "./match-pcb-port-with-pad"

export const associatePcbPortsWithPads = (elms: Type.AnyElement[]) => {
  const ports = elms
    .filter((elm): elm is Type.PCBPort => elm.type === "pcb_port")
    .map((elm) => ({
      pcb_port: elm,
      source_port: elms.find(
        (elm2): elm2 is Type.SourcePort =>
          elm2.type === "source_port" &&
          elm2.source_port_id === elm.source_port_id
      )!,
    }))

  const pads = elms.filter(
    (elm): elm is Type.PCBPlatedHole | Type.PCBSMTPad =>
      elm.type === "pcb_plated_hole" || elm.type === "pcb_smtpad"
  )

  for (const { pcb_port, source_port } of ports) {
    const matched_pad = matchPcbPortWithPad({
      pcb_port,
      source_port,
      pads,
    })

    if (matched_pad) {
      matched_pad.pcb_port_id = pcb_port.pcb_port_id
      pcb_port.x = matched_pad.x
      pcb_port.y = matched_pad.y
      if ("layers" in matched_pad) {
        pcb_port.layers = matched_pad.layers
      } else if ("layer" in matched_pad) {
        ;(pcb_port as any).layers = [matched_pad.layer]
      }
    }
  }
}
