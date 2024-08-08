import type {
  AnySoupElement,
  SchematicNetLabel,
  SchematicTrace,
  SourceNet,
  SourcePort,
  SourceTrace,
} from "@tscircuit/soup"
import { su } from "@tscircuit/soup-util"
import Debug from "debug"
import type { BuildContext } from "lib/types"
import { directionToVec, oppositeSide } from "lib/utils"
import { isTruthy } from "lib/utils/is-truthy"
import { buildPcbTraceElements } from "./build-pcb-trace-elements"

const debug = Debug("tscircuit:builder:trace-builder")

export const buildTraceForSinglePortAndNet = (
  params: {
    source_net: SourceNet
    source_port: SourcePort
    parent_elements: AnySoupElement[]
    thickness: number | string
    pcb_route_hints: any[]
  },
  bc: BuildContext
): AnySoupElement[] => {
  const { source_port, source_net } = params

  const source_port_ids_in_net =
    bc.source_ports_for_nets_in_group?.[source_net.name] ?? []

  const source_trace_id = bc.getId("source_trace")

  const schematic_port = su(params.parent_elements).schematic_port.getWhere({
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
  const nl_vec = {
    x: port_vec.x * Math.max(0.5, 0.1 * source_net.name.length),
    y: port_vec.y * 0.5,
  }
  const is_vertical = Math.abs(port_vec.y) > 0.5
  // HACK: I just eyeball'd this equation, it's the distance between the port
  // and the net label line
  const tip_to_port_dist = is_vertical
    ? 0.3
    : 0.3 - Math.max(0, 0.04 * source_net.name.length - 0.2)

  // 1. create a schematic_net_label
  const schematic_net_label: SchematicNetLabel = {
    type: "schematic_net_label",
    source_net_id: source_net.source_net_id,
    text: source_net.name,
    anchor_side: oppositeSide(schematic_port.facing_direction),
    center: {
      x: schematic_port.center.x + nl_vec.x,
      y: schematic_port.center.y + nl_vec.y,
    },
  }

  // Create a trace connecting the port to the net label
  const schematic_trace: SchematicTrace = {
    type: "schematic_trace",
    schematic_trace_id: bc.getId("schematic_trace"),
    source_trace_id: source_trace.source_trace_id,
    edges: [
      {
        from: {
          x: schematic_port.center.x,
          y: schematic_port.center.y,
        },
        to: {
          x: schematic_port.center.x + port_vec.x * tip_to_port_dist,
          y: schematic_port.center.y + port_vec.y * tip_to_port_dist,
        },
        from_schematic_port_id: schematic_port.schematic_port_id,
      },
    ],
  }

  // HACK: Connect to all ports in net (not really the best solution...)
  // TODO check if already connected
  const source_port_ids_in_route = Array.from(
    new Set([source_port.source_port_id, ...source_port_ids_in_net])
  )

  const pcb_elements: AnySoupElement[] = []
  debug("source_port_ids_in_route", source_port_ids_in_route)
  if (source_port_ids_in_route.length > 1 && !bc.routing_disabled) {
    const source_ports_in_route = source_port_ids_in_route
      .map((id) => su(params.parent_elements).source_port.get(id))
      .filter(isTruthy)

    const { pcb_errors, pcb_trace, pcb_vias } = buildPcbTraceElements(
      {
        elements: params.parent_elements,
        source_trace_id,
        pcb_route_hints: [],
        thickness: source_net.trace_width ?? 0.1,
        source_ports_in_route,
      },
      bc
    )

    pcb_elements.push(...pcb_errors, ...pcb_vias, pcb_trace)
  }

  return [source_trace, schematic_net_label, schematic_trace, ...pcb_elements]
}
