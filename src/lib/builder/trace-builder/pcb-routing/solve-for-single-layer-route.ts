import { findRoute } from "@tscircuit/routing"
import type { LayerRef, PCBTrace, Point } from "@tscircuit/soup"
import Debug from "debug"
import { default_pcb_solver_grid, type PcbSolverGrid } from "./pcb-solver-grid"
import type { TracePcbRoutingContext } from "./trace-pcb-routing-context"

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
      for (let i = 0; i < solved_route.points.length; i++) {
        const point = solved_route.points[i]
        route.push({
          route_type: "wire",
          layer,
          width: thickness_mm,
          x: point.x,
          y: point.y,
          start_pcb_port_id:
            i === 0
              ? ctx.pcb_terminal_port_ids[0]
              : i === solved_route.points.length - 1
              ? ctx.pcb_terminal_port_ids[1]
              : undefined,
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
