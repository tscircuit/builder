import { extractIds } from "./../../utils/extract-ids"
// TODO rename this to trace-builder

import * as Type from "lib/types"
import { Except, Simplify } from "type-fest"
import { ProjectBuilder, GroupBuilder } from ".."
import { ProjectClass, createProjectFromElements } from "lib/project"
import { applySelector } from "lib/apply-selector"
export { convertToReadableTraceTree } from "./convert-to-readable-route-tree"
import { straightRouteSolver } from "./straight-route-solver"
import { rmstSolver } from "./rmst-solver"
import { route1Solver } from "./route1-solver"
import { findRoute } from "@tscircuit/routing"
import { getSchematicObstaclesFromElements } from "./get-schematic-obstacles-from-elements"

type RouteSolverOrString = Type.RouteSolver | "rmst" | "straight" | "route1"

export type TraceBuilderCallback = (cb: TraceBuilder) => unknown
export interface TraceBuilder {
  builder_type: "trace_builder"
  project_builder: ProjectBuilder
  parent: GroupBuilder
  setProps: (props: { path?: string[] }) => TraceBuilder
  setRouteSolver: (routeSolver: RouteSolverOrString) => TraceBuilder
  addConnections: (portSelectors: Array<string>) => TraceBuilder
  build(elements: Type.AnyElement[]): Promise<Type.AnyElement[]>
}

export const createTraceBuilder = (
  project_builder: ProjectBuilder
): TraceBuilder => {
  const builder: TraceBuilder = {
    project_builder,
    builder_type: "trace_builder",
  } as any
  const internal: any = {
    portSelectors: [] as string[],
    routeSolver: route1Solver,
  }

  builder.addConnections = (portSelectors) => {
    internal.portSelectors.push(...portSelectors)
    return builder
  }

  builder.setRouteSolver = (routeSolver: RouteSolverOrString) => {
    if (typeof routeSolver === "string") {
      internal.routeSolver =
        routeSolver === "rmst"
          ? rmstSolver
          : routeSolver === "route1"
          ? route1Solver
          : routeSolver === "straight"
          ? straightRouteSolver
          : route1Solver // TODO default to rmstOrRoute1Solver
    }
    internal.routeSolver = routeSolver
    return builder
  }

  builder.setProps = (props) => {
    if (props.path) {
      builder.addConnections(props.path)
    }
    return builder
  }

  builder.build = async (parentElements: Type.AnyElement[] = []) => {
    const sourcePortsInRoute: Type.SourcePort[] = []
    for (const portSelector of internal.portSelectors) {
      const selectedElms = applySelector(parentElements, portSelector)
      if (selectedElms.length === 0) {
        return [
          {
            type: "source_error",
            message: `No elements found for selector: ${portSelector}`,
            ...extractIds(parentElements?.[0] ?? {}),
          },
        ]
      }
      for (const selectedElm of selectedElms) {
        if (selectedElm.type !== "source_port") {
          return [
            {
              type: "source_error",
              message: `non-source_port "${JSON.stringify(
                selectedElm,
                null,
                "  "
              )}" selected by selector "${portSelector}" `,
              ...extractIds(selectedElm),
            },
          ]
        }
        sourcePortsInRoute.push(selectedElm)
      }
    }

    const source_trace_id = builder.project_builder.getId("source_trace")
    const source_trace: Type.SourceTrace = {
      type: "source_trace",
      source_trace_id,
      connected_source_port_ids: sourcePortsInRoute.map(
        (sp) => sp.source_port_id
      ),
    }

    // ----------------------------
    // SCHEMATIC ROUTING
    // ----------------------------

    const schematic_trace_id = builder.project_builder.getId("schematic_trace")

    const schematicTerminals = sourcePortsInRoute.map((sp) => {
      const schematic_port = parentElements.find(
        (elm) =>
          elm.type === "schematic_port" &&
          elm.source_port_id === sp.source_port_id
      ) as Type.SchematicPort | null
      if (!schematic_port)
        throw new Error(
          `Missing schematic_port for source_port "${sp.source_port_id}"`
        )
      return {
        x: schematic_port.center.x,
        y: schematic_port.center.y,
        schematic_port_id: schematic_port.schematic_port_id,
        facing_direction: schematic_port.facing_direction,
      }
    })

    const edges = await internal.routeSolver({
      terminals: schematicTerminals,
      obstacles: getSchematicObstaclesFromElements(parentElements, {
        excluded_schematic_port_ids: schematicTerminals.map(
          (t) => t.schematic_port_id
        ),
      }),
    })

    const schematic_trace: Type.SchematicTrace = {
      type: "schematic_trace",
      source_trace_id: source_trace_id,
      schematic_trace_id,
      edges,
    }

    // ----------------------------
    // PCB ROUTING
    // ----------------------------

    const pcb_trace_id = builder.project_builder.getId("pcb_trace")
    const pcb_errors: Type.PCBError[] = []

    const pcb_terminals = sourcePortsInRoute.map((sp) => {
      const pcb_port = parentElements.find(
        (elm) =>
          elm.type === "pcb_port" && elm.source_port_id === sp.source_port_id
      ) as Type.PCBPort | null
      if (!pcb_port)
        throw new Error(
          `source_port "${sp.source_port_id}" is missing a pcb_port`
        )
      return pcb_port
    })

    const pcb_route: Type.PCBTrace["route"] = []
    try {
      const solved_route = findRoute({
        grid: {
          marginSegments: 2,
          maxGranularSearchSegments: 50,
          segmentSize: 1, // mm
        },
        obstacles: [],
        pointsToConnect: pcb_terminals,
      })

      if (solved_route.pathFound) {
        for (const point of solved_route.points) {
          pcb_route.push({
            route_type: "wire",
            layer: { name: "top" },
            width: 0.5,
            x: point.x,
            y: point.y,
            // TODO add start_pcb_port_id & end_pcb_port_id
          })
        }
      }
    } catch (e) {
      pcb_errors.push({
        pcb_error_id: builder.project_builder.getId("pcb_error"),
        type: "pcb_error",
        error_type: "pcb_trace_error",
        message: `Error while pcb-trace-route solving: ${e.toString()}`,
        pcb_trace_id,
        source_trace_id,
        pcb_component_ids: [], // TODO
      })
    }

    // TODO construct route from pcb_terminals

    const pcb_trace: Type.PCBTrace = {
      type: "pcb_trace",
      pcb_trace_id,
      source_trace_id: source_trace_id,
      route: pcb_route,
    }

    return [source_trace, schematic_trace, pcb_trace, ...pcb_errors]
  }

  return builder
}
