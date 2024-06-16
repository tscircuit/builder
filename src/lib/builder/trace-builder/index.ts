import { InputPoint } from "./../../soup/common/point"
import { extractIds } from "./../../utils/extract-ids"
// TODO rename this to trace-builder

import su from "@tscircuit/soup-util"
import * as Type from "lib/types"
import { Except, Simplify } from "type-fest"
import { ProjectBuilder, GroupBuilder } from ".."
import { ProjectClass, createProjectFromElements } from "lib/project"
import { applySelector } from "lib/apply-selector"
export { convertToReadableTraceTree } from "./convert-to-readable-route-tree"
import { straightRouteSolver } from "./route-solvers/straight-route-solver"
// import { rmstSolver } from "./rmst-solver"
import { route1Solver } from "./route-solvers/route1-solver"
import { Point } from "lib/soup"
import { getSchematicObstaclesFromElements } from "./schematic-routing/get-schematic-obstacles-from-elements"
import { pairs } from "lib/utils/pairs"
import { mergeRoutes } from "./pcb-routing/merge-routes"
import { uniq } from "lib/utils/uniq"
import { findPossibleTraceLayerCombinations } from "./find-possible-trace-layer-combinations"
import { AnySoupElement, SourceNet } from "@tscircuit/soup"
import { buildTraceForSinglePortAndNet } from "./build-trace-for-single-port-and-net"
import { getPcbObstacles } from "./pcb-routing/get-pcb-obstacles"
import { solveForSingleLayerRoute } from "./pcb-routing/solve-for-single-layer-route"
import { PcbRoutingContext } from "./pcb-routing/pcb-routing-context"
import { solveForRoute } from "./pcb-routing/solve-for-route"
import { createNoCommonLayersError } from "./pcb-errors"

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
    routeSolver: route1Solver as Type.RouteSolver,
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
          ? route1Solver
          : routeSolver === "straight"
          ? straightRouteSolver
          : route1Solver // TODO default to rmstOrRoute1Solver
    }
    internal.routeSolver = routeSolver as any
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
      return buildTraceForSinglePortAndNet(
        {
          source_net: source_nets_in_route[0],
          source_port: source_ports_in_route[0],
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

    // ----------------------------
    // PCB ROUTING
    // ----------------------------

    const pcb_trace_id = builder.project_builder.getId("pcb_trace")
    const pcb_errors: Type.PCBError[] = []

    const pcb_terminals = source_ports_in_route.map((sp) => {
      const pcb_port = parent_elements.find(
        (elm) =>
          elm.type === "pcb_port" && elm.source_port_id === sp.source_port_id
      ) as Type.PCBPort | null
      if (!pcb_port)
        throw new Error(
          `source_port "${sp.source_port_id}" is missing a pcb_port`
        )
      return pcb_port
    })
    const pcb_terminal_port_ids = pcb_terminals.map((t) => t.pcb_port_id)

    if (internal.pcb_route_hints.length > 0 && pcb_terminals.length !== 2) {
      throw new Error(
        "PCB route hints currently aren't supported for traces with more than 2 terminals"
      )
    }

    const thickness_mm =
      internal.thickness === "inherit"
        ? 0.2 // TODO derive from net/context
        : bc.convert(internal.thickness as any)
    const pcb_obstacles = getPcbObstacles({
      elements: parent_elements,
      pcb_terminal_port_ids,
      obstacle_margin: thickness_mm * 2,
    })
    const pcb_routing_ctx: PcbRoutingContext = {
      ...bc,
      mutable_pcb_errors: pcb_errors,
      source_trace_id,
      pcb_trace_id,
      pcb_terminal_port_ids,
      thickness_mm,
      elements: parent_elements,
      pcb_obstacles,
    }

    const pcb_route: Type.PCBTrace["route"] = []

    // TODO put in solve for Route

    let pcb_route_hints = internal.pcb_route_hints ?? []

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
        const routes: Type.PCBTrace["route"][] = []

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
            pcb_error_id: builder.project_builder.getId("pcb_error"),
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
    const pcb_vias: Type.PCBVia[] = [
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
            } as Type.PCBVia,
          ]
        }
        return []
      }),
    ].filter((via: any): via is Type.PCBVia => via !== null)

    const pcb_trace: Type.PCBTrace = {
      type: "pcb_trace",
      pcb_trace_id,
      source_trace_id: source_trace_id,
      route: pcb_route,
    }

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
