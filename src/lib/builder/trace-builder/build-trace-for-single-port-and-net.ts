import type {
  AnySoupElement,
  SchematicNetLabel,
  SourceNet,
  SourcePort,
  SourceTrace,
} from "@tscircuit/soup"
import { su } from "@tscircuit/soup-util"
import type { BuildContext } from "lib/types"
import { directionToVec, oppositeSide } from "lib/utils"

export const buildTraceForSinglePortAndNet = (
  params: {
    source_net: SourceNet
    source_port: SourcePort
    parent_elements: AnySoupElement[]
  },
  bc: BuildContext
): AnySoupElement[] => {
  const { source_port, source_net } = params

  const source_trace_id = bc.getId("source_trace")

  const schematic_port = su(
    params.parent_elements as any
  ).schematic_port.getWhere({
    source_port_id: source_port.source_port_id,
  })

  if (!schematic_port) {
    return [
      {
        type: "schematic_error",
        error_type: "schematic_port_not_found",
        schematic_error_id: bc.getId("schematic_error"),
        message: `Could not find schematic_port for source_port "${source_port.name}"`,
      },
    ]
  }

  if (!schematic_port.facing_direction) {
    throw new Error("schematic_port is missing a direction for a net label")
  }

  const source_trace: SourceTrace = {
    type: "source_trace",
    connected_source_port_ids: [source_port.source_port_id],
    connected_source_net_ids: [source_net.source_net_id],
    source_trace_id,
  }

  const port_vec = directionToVec(schematic_port.facing_direction)

  // 1. create a schematic_net_label
  const schematic_net_label: SchematicNetLabel = {
    type: "schematic_net_label",
    source_net_id: source_net.source_net_id,
    text: source_net.name,
    anchor_side: oppositeSide(schematic_port.facing_direction),
    center: {
      x: schematic_port.center.x + port_vec.x * 1,
      y: schematic_port.center.y + port_vec.y * 1,
    },
  }

  // 2. create a pcb_error that we need to connect the net (we'll fix this later)
  // alternatively, attempt to find nearest port also connected to the net and
  // attempt to connect to that?

  return [source_trace, schematic_net_label]
}
