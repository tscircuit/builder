import { findRoute } from "@tscircuit/routing"
import type { LayerRef, PCBTrace, Point } from "@tscircuit/soup"
import type { PcbObstacle } from "./get-pcb-obstacles"
import { PcbSolverGrid, default_pcb_solver_grid } from "./pcb-solver-grid"
import type { TracePcbRoutingContext } from "./trace-pcb-routing-context"
import Debug from "debug"

const debug = Debug("tscircuit:builder:trace-builder")

export function solveForSingleLayerRoute(
  params: {
    terminals: Point[]
    layer: LayerRef
    pcb_solver_grid?: PcbSolverGrid
  },
  ctx: TracePcbRoutingContext
): PCBTrace["route"] {
  const { terminals, layer, pcb_solver_grid = default_pcb_solver_grid } = params
  const { thickness_mm, pcb_obstacles } = ctx
  try {
    debug("sending to @tscircuit/routing findRoute...")
    const findRouteArgs = {
      grid: pcb_solver_grid,
      obstacles: pcb_obstacles.filter((obstacle) =>
        obstacle.layers.includes(layer)
      ),
      pointsToConnect: terminals,
    }

    if (debug.enabled && globalThis.logTmpFile) {
      globalThis.logTmpFile("findRouteArgs", findRouteArgs)
    }
    const solved_route = findRoute(findRouteArgs)

    debug("route found?", solved_route.pathFound)

    if (solved_route.pathFound) {
      const route: PCBTrace["route"] = []
      for (const point of solved_route.points) {
        route.push({
          route_type: "wire",
          layer,
          width: thickness_mm,
          x: point.x,
          y: point.y,
          // TODO add start_pcb_port_id & end_pcb_port_id
        })
      }
      return route
    }

    ctx.mutable_pcb_errors.push({
      pcb_error_id: ctx.getId("pcb_error"),
      type: "pcb_error",
      error_type: "pcb_trace_error",
      message: `No route found for pcb_trace_id ${ctx.pcb_trace_id}`,
      pcb_trace_id: ctx.pcb_trace_id!,
      source_trace_id: ctx.source_trace_id!,
      pcb_component_ids: [], // TODO
      pcb_port_ids: ctx.pcb_terminal_port_ids!,
    })

    return []
  } catch (e) {
    ctx.mutable_pcb_errors.push({
      pcb_error_id: ctx.getId("pcb_error"),
      type: "pcb_error",
      error_type: "pcb_trace_error",
      message: `Error while pcb-trace-route solving: ${e.toString()}`,
      pcb_trace_id: ctx.pcb_trace_id!,
      source_trace_id: ctx.source_trace_id!,
      pcb_component_ids: [], // TODO
      pcb_port_ids: ctx.pcb_terminal_port_ids!,
    })
    return []
  }
}
