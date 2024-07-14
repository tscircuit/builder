import { BuildContext } from "lib/types"
import type {
  AnySoupElement,
  PCBTraceError,
  SourcePort,
  InputPoint,
  PCBTrace,
  PCBVia,
  PCBPort,
} from "@tscircuit/soup"
import { TracePcbRoutingContext } from "./pcb-routing/trace-pcb-routing-context"
import { su } from "@tscircuit/soup-util"
import { solveForRoute } from "./pcb-routing/solve-for-route"
import { findPossibleTraceLayerCombinations } from "./pcb-routing/find-possible-trace-layer-combinations"
import { createNoCommonLayersError } from "./pcb-errors"
import { pairs } from "lib/utils/pairs"
import { mergeRoutes } from "./pcb-routing/merge-routes"
import { getPcbObstacles } from "./pcb-routing/get-pcb-obstacles"
import Debug from "debug"

const debug = Debug("tscircuit:builder:trace-builder")

type BuildPcbTraceElementsParams = {
  elements: AnySoupElement[]
  source_ports_in_route: SourcePort[]
  source_trace_id: string
  thickness: string | number
  pcb_route_hints: InputPoint[]
}

export const buildPcbTraceElements = (
  params: BuildPcbTraceElementsParams,
  bc: BuildContext
) => {
  const {
    elements: parent_elements,
    source_ports_in_route,
    source_trace_id,
    thickness,
    pcb_route_hints = [],
  } = params
  // ----------------------------
  // PCB ROUTING
  // ----------------------------

  const pcb_trace_id = bc.getId("pcb_trace")
  const pcb_errors: PCBTraceError[] = []

  const pcb_terminals = source_ports_in_route.map((sp) => {
    const pcb_port = parent_elements.find(
      (elm) =>
        elm.type === "pcb_port" && elm.source_port_id === sp.source_port_id
    ) as PCBPort | null
    if (!pcb_port)
      throw new Error(
        `source_port "${sp.source_port_id}" is missing a pcb_port`
      )
    return pcb_port
  })
  const pcb_terminal_port_ids = pcb_terminals.map((t) => t.pcb_port_id)
  debug("pcb_terminal_port_ids", pcb_terminal_port_ids)

  if (pcb_route_hints.length > 0 && pcb_terminals.length !== 2) {
    throw new Error(
      "PCB route hints currently aren't supported for traces with more than 2 terminals"
    )
  }

  const thickness_mm =
    thickness === "inherit"
      ? 0.2 // TODO derive from net/context
      : bc.convert(thickness as any)
  const pcb_obstacles = getPcbObstacles({
    elements: parent_elements,
    pcb_terminal_port_ids,
    obstacle_margin: thickness_mm * 2,
  })
  const pcb_routing_ctx: TracePcbRoutingContext = {
    ...bc,
    mutable_pcb_errors: pcb_errors,
    source_trace_id,
    pcb_trace_id,
    pcb_terminal_port_ids,
    thickness_mm,
    elements: parent_elements,
    pcb_obstacles,
  }

  const pcb_route: PCBTrace["route"] = []

  if (pcb_route_hints.length === 0) {
    // check if there are any trace_hints that are relevant to our ports, if
    // there are, use them as our route hints
    const port0_hint = su(parent_elements).pcb_trace_hint.getWhere({
      pcb_port_id: pcb_terminal_port_ids[0],
    })
    const port1_hint = su(parent_elements).pcb_trace_hint.getWhere({
      pcb_port_id: pcb_terminal_port_ids[1],
    })

    if (port0_hint) {
      pcb_route_hints.push(...port0_hint.route)
    }
    if (port1_hint) {
      pcb_route_hints.push(...[...port1_hint.route].reverse())
    }
  }

  if (pcb_route_hints.length === 0) {
    debug("no pcb route hints, solving for route")
    pcb_route.push(...solveForRoute(pcb_terminals, pcb_routing_ctx))
  } else {
    // TODO add support for more than 2 terminals w/ hints
    const ordered_pcb_terminals_and_hints = [
      pcb_terminals[0],
      ...(pcb_route_hints as any).map((p) => ({
        ...p,
        x: bc.convert(p.x),
        y: bc.convert(p.y),
      })),
      pcb_terminals[1],
    ]

    const candidate_layer_combinations = findPossibleTraceLayerCombinations(
      ordered_pcb_terminals_and_hints
    )

    if (candidate_layer_combinations.length === 0) {
      pcb_errors.push(createNoCommonLayersError(pcb_routing_ctx))
    } else {
      const routes: PCBTrace["route"][] = []

      // TODO explore all candidate layer combinations
      const layer_selection = candidate_layer_combinations[0].layer_path

      const ordered_with_layer_hints = ordered_pcb_terminals_and_hints.map(
        (t, idx) => {
          if (t.via) {
            return {
              ...t,
              via_to_layer: layer_selection[idx],
            }
          } else {
            return { ...t, layers: [layer_selection[idx]] }
          }
        }
      )

      for (let [a, b] of pairs(ordered_with_layer_hints)) {
        routes.push(solveForRoute([a, b], pcb_routing_ctx))
      }
      if (routes.some((route) => route.length === 0)) {
        pcb_errors.push({
          pcb_error_id: bc.getId("pcb_error"),
          type: "pcb_error",
          error_type: "pcb_trace_error",
          message: `No route could be found for terminals`,
          pcb_trace_id,
          source_trace_id,
          pcb_component_ids: [], // TODO
          pcb_port_ids: pcb_terminal_port_ids,
        })
      } else {
        pcb_route.push(...mergeRoutes(routes))
      }
    }
  }

  // Iterate over the pcb_route and if there is a layer switch without an
  // associated port, add a via. This is a bit of a hack, it maybe should
  // be done by explicitly adding the via in the route / inside the
  // solveForRoute function
  const pcb_vias: PCBVia[] = [
    ...pairs(pcb_route).flatMap(([a, b]) => {
      if ("layer" in a && "layer" in b && a.layer !== b.layer) {
        return [
          {
            type: "pcb_via",
            x: a.x,
            y: a.y,
            from_layer: a.layer,
            to_layer: b.layer,
            hole_diameter: 0.2,
            outer_diameter: 0.4,
          } as PCBVia,
        ]
      }
      return []
    }),
  ].filter((via: any): via is PCBVia => via !== null)

  const pcb_trace: PCBTrace = {
    type: "pcb_trace",
    pcb_trace_id,
    source_trace_id: source_trace_id,
    route: pcb_route,
  }

  return { pcb_trace, pcb_vias, pcb_errors }
}
