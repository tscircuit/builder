import type { InputPoint } from "./../../soup/common/point"
import { extractIds } from "./../../utils/extract-ids"

import type * as Type from "lib/types"
import type { ProjectBuilder, GroupBuilder } from ".."
import { applySelector } from "lib/apply-selector"
export { convertToReadableTraceTree } from "./convert-to-readable-route-tree"
import { straightRouteSolver } from "./route-solvers/straight-route-solver"
import { route1Solver } from "./route-solvers/route1-solver"
import { getSchematicObstaclesFromElements } from "./schematic-routing/get-schematic-obstacles-from-elements"
import { pairs } from "lib/utils/pairs"
import type { AnySoupElement, SourceNet } from "@tscircuit/soup"
import { buildTraceForSinglePortAndNet } from "./build-trace-for-single-port-and-net"
import { buildPcbTraceElements } from "./build-pcb-trace-elements"
import { portOffsetWrapper } from "./route-solvers/port-offset-wrapper"
import Debug from "debug"

const debug = Debug("tscircuit:builder:trace-builder")

type RouteSolverOrString = Type.RouteSolver | "rmst" | "straight" | "route1"

export type TraceBuilderCallback = (cb: TraceBuilder) => unknown
export interface TraceBuilder {
  builder_type: "trace_builder"
  project_builder: ProjectBuilder
  parent: GroupBuilder
  setProps: (props: {
    path?: string[]
    from?: string
    to?: string
    schematic_route_hints?: InputPoint[]
    pcb_route_hints?: Type.PcbRouteHintInput[]
    thickness?: string | number
  }) => TraceBuilder
  getConnections: () => string[]
  getNetNames: () => string[]
  setRouteSolver: (routeSolver: RouteSolverOrString) => TraceBuilder
  addConnections: (portSelectors: Array<string>) => TraceBuilder
  getSourcePortsAndNetsInRoute: (parent_elements: Type.AnyElement[]) => {
    source_ports_in_route: Type.SourcePort[]
    source_nets_in_route: SourceNet[]
    source_errors: any[]
  }
  build(
    elements: Type.AnyElement[],
    bc: Type.BuildContext
  ): Promise<Type.AnyElement[]>
}

export interface PCBRouteHint extends InputPoint {
  via?: boolean
  via_to_layer?: string
}

export const createTraceBuilder = (
  project_builder: ProjectBuilder
): TraceBuilder => {
  const builder: TraceBuilder = {
    project_builder,
    builder_type: "trace_builder",
  } as any
  const internal = {
    portSelectors: [] as string[],
    routeSolver: portOffsetWrapper(route1Solver as Type.RouteSolver),
    schematic_route_hints: [] as InputPoint[],
    pcb_route_hints: [] as InputPoint[],
    thickness: "inherit" as string | number,
  }

  builder.addConnections = (portSelectors) => {
    internal.portSelectors.push(...portSelectors)
    return builder
  }

  builder.setRouteSolver = (routeSolver: RouteSolverOrString) => {
    if (typeof routeSolver === "string") {
      internal.routeSolver =
        // routeSolver === "rmst"
        // ? rmstSolver
        // :
        routeSolver === "route1"
          ? portOffsetWrapper(route1Solver)
          : routeSolver === "straight"
          ? straightRouteSolver
          : portOffsetWrapper(route1Solver) // TODO default to rmstOrRoute1Solver
    }
    internal.routeSolver = portOffsetWrapper(routeSolver as any) as any
    return builder
  }

  builder.getConnections = () => internal.portSelectors

  builder.setProps = (props) => {
    if (props.path) {
      builder.addConnections(props.path)
    }
    if (props.from && props.to) {
      builder.addConnections([props.from, props.to])
    }
    if (props.schematic_route_hints) {
      internal.schematic_route_hints = props.schematic_route_hints
    }
    if (props.pcb_route_hints) {
      internal.pcb_route_hints = props.pcb_route_hints
    }
    if (props.thickness) {
      internal.thickness = props.thickness
    }
    return builder
  }

  builder.getNetNames = () => {
    return internal.portSelectors
      .filter((p) => p.startsWith("net."))
      .map((p) => p.slice(4))
  }

  builder.getSourcePortsAndNetsInRoute = (
    parent_elements: Type.AnyElement[]
  ) => {
    const source_ports_in_route: Type.SourcePort[] = []
    const source_nets_in_route: SourceNet[] = []
    for (const portSelector of internal.portSelectors) {
      const selectedElms = applySelector(parent_elements, portSelector)
      if (selectedElms.length === 0) {
        return {
          source_errors: [
            {
              type: "source_error",
              message: `No elements found for selector: ${portSelector}`,
              ...extractIds(parent_elements?.[0] ?? {}),
            },
          ],
          source_nets_in_route: [],
          source_ports_in_route: [],
        }
      }
      for (const selectedElm of selectedElms) {
        if (
          selectedElm.type !== "source_port" &&
          selectedElm.type !== "source_net"
        ) {
          return {
            source_ports_in_route: [],
            source_nets_in_route: [],
            source_errors: [
              {
                type: "source_error",
                message: `non-source_port "${JSON.stringify(
                  selectedElm,
                  null,
                  "  "
                )}" selected by selector "${portSelector}" `,
                ...extractIds(selectedElm),
              },
            ],
          }
        }
        if (selectedElm.type === "source_port") {
          source_ports_in_route.push(selectedElm)
        } else if (selectedElm.type === "source_net") {
          source_nets_in_route.push(selectedElm)
        }
      }
    }
    return { source_ports_in_route, source_nets_in_route, source_errors: [] }
  }

  builder.build = async (
    parent_elements: AnySoupElement[] = [],
    bc: Type.BuildContext
  ) => {
    const { source_ports_in_route, source_nets_in_route, source_errors } =
      builder.getSourcePortsAndNetsInRoute(parent_elements)

    if (source_errors?.length > 0) return source_errors

    if (
      source_ports_in_route.length === 1 &&
      source_nets_in_route.length === 1
    ) {
      debug("building trace for single port and net")
      return buildTraceForSinglePortAndNet(
        {
          source_net: source_nets_in_route[0],
          source_port: source_ports_in_route[0],
          thickness: internal.thickness,
          pcb_route_hints: internal.pcb_route_hints,
          parent_elements,
        },
        bc
      )
    }

    const source_trace_id = builder.project_builder.getId("source_trace")
    const source_trace: Type.SourceTrace = {
      type: "source_trace",
      source_trace_id,
      connected_source_port_ids: source_ports_in_route.map(
        (sp) => sp.source_port_id
      ),
    }

    // ----------------------------
    // SCHEMATIC ROUTING
    // ----------------------------

    const schematic_trace_id = builder.project_builder.getId("schematic_trace")

    const schematicTerminals = source_ports_in_route.map((sp) => {
      const schematic_port = parent_elements.find(
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

    const schematic_obstacles = getSchematicObstaclesFromElements(
      parent_elements,
      {
        excluded_schematic_port_ids: schematicTerminals.map(
          (t) => t.schematic_port_id
        ),
      }
    )

    // TODO search for <routehint /> in soup, then construct a routehints array

    const schematic_route_hints = (internal.schematic_route_hints ?? []).map(
      (p) => bc.convert(p as any)
    )

    let ordered_terminals = schematicTerminals

    if (schematicTerminals.length !== 2 && schematic_route_hints.length > 0) {
      throw new Error(
        "Schematic route hints currently aren't supported for traces with more than 2 terminals"
      )
    }

    if (schematic_route_hints.length > 0) {
      ordered_terminals = [
        schematicTerminals[0],
        ...(schematic_route_hints as any),
        schematicTerminals[1],
      ]
    }

    let edges: Type.RouteEdge[]

    if (schematic_route_hints.length === 0) {
      edges = await internal.routeSolver({
        terminals: schematicTerminals,
        obstacles: schematic_obstacles,
      })
    } else {
      edges = (
        await Promise.all(
          pairs(ordered_terminals).map(([a, b]) =>
            internal.routeSolver({
              terminals: [a, b],
              obstacles: schematic_obstacles,
            })
          )
        )
      ).reduce((all_edges, edges_arr) => all_edges.concat(edges_arr), [])
    }

    const schematic_trace: Type.SchematicTrace = {
      type: "schematic_trace",
      source_trace_id: source_trace_id,
      schematic_trace_id,
      edges,
    }

    const { pcb_trace, pcb_vias, pcb_errors } = buildPcbTraceElements(
      {
        elements: parent_elements,
        source_ports_in_route,
        source_trace_id,
        thickness: internal.thickness,
        pcb_route_hints: internal.pcb_route_hints,
      },
      bc
    )

    return [
      source_trace,
      schematic_trace,
      pcb_trace,
      ...pcb_vias,
      ...pcb_errors,
    ] as Type.AnyElement[]
  }

  return builder
}
