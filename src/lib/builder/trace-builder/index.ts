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
import { straightRouteSolver } from "./straight-route-solver"
import { rmstSolver } from "./rmst-solver"
import { route1Solver } from "./route1-solver"
import { findRoute } from "@tscircuit/routing"
import { Point } from "lib/soup"
import { getSchematicObstaclesFromElements } from "./get-schematic-obstacles-from-elements"
import { pairs } from "lib/utils/pairs"
import { mergeRoutes } from "./merge-routes"
import { uniq } from "lib/utils/uniq"
import { findPossibleTraceLayerCombinations } from "./find-possible-trace-layer-combinations"
import { SourceNet } from "@tscircuit/soup"
import { buildTraceForSinglePortAndNet } from "./build-trace-for-single-port-and-net"

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
        routeSolver === "rmst"
          ? rmstSolver
          : routeSolver === "route1"
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
    parent_elements: Type.AnyElement[] = [],
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
    const omargin = thickness_mm * 2
    const pcb_obstacles: Array<{
      center: { x: number; y: number }
      width: number
      height: number
      layers: Type.LayerRef[]
    }> = [
      ...parent_elements
        .filter((elm): elm is Type.PCBSMTPad => elm.type === "pcb_smtpad")
        // Exclude the pads that are connected to the trace
        .filter((elm) => !pcb_terminal_port_ids.includes(elm.pcb_port_id!))
        .map((pad) => {
          if (pad.shape === "rect") {
            return {
              center: { x: pad.x, y: pad.y },
              width: pad.width + omargin * 2,
              height: pad.height + omargin * 2,
              layers: [pad.layer],
            }
          } else if (pad.shape === "circle") {
            // TODO support better circle obstacles
            return {
              center: { x: pad.x, y: pad.y },
              width: pad.radius * 2 + omargin * 2,
              height: pad.radius * 2 + omargin * 2,
              layers: [pad.layer],
            }
          }
          throw new Error(
            `Invalid pad shape for pcb_smtpad "${(pad as any).shape}"`
          )
        }),
      ...parent_elements
        .filter(
          (elm): elm is Type.PCBPlatedHole => elm.type === "pcb_plated_hole"
        )
        // Exclude the holes that are connected to the trace
        .filter((elm) => !pcb_terminal_port_ids.includes(elm.pcb_port_id!))
        .map((hole) => {
          return {
            center: { x: hole.x, y: hole.y },
            width: hole.outer_diameter + omargin * 2,
            height: hole.outer_diameter + omargin * 2,
            layers: hole.layers,
          }
        }),
    ]
    const pcb_solver_grid = {
      marginSegments: 20,
      maxGranularSearchSegments: 50,
      segmentSize: 0.2, // mm
    }

    const pcb_route: Type.PCBTrace["route"] = []

    function solveForSingleLayerRoute(
      terminals: Point[],
      layer: Type.LayerRef
    ) {
      try {
        const solved_route = findRoute({
          grid: pcb_solver_grid,
          obstacles: pcb_obstacles.filter((obstacle) =>
            obstacle.layers.includes(layer)
          ),
          pointsToConnect: terminals,
        })

        if (solved_route.pathFound) {
          const route: Type.PCBTrace["route"] = []
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
        return []
      } catch (e) {
        pcb_errors.push({
          pcb_error_id: builder.project_builder.getId("pcb_error"),
          type: "pcb_error",
          error_type: "pcb_trace_error",
          message: `Error while pcb-trace-route solving: ${e.toString()}`,
          pcb_trace_id,
          source_trace_id,
          pcb_component_ids: [], // TODO
          pcb_port_ids: pcb_terminal_port_ids,
        })
        return []
      }
    }

    function solveForRoute(
      terminals: Array<Type.PCBPort | Type.PcbRouteHint>
    ): Type.PCBTrace["route"] {
      // 1. if all terminals are on the same layer, solve
      // 2. if some terminals have layer unspecified but at least one does, and
      //    there are no disagreeing layers, solve
      // 3. if this is a terminal pair and it's across two layers, check if one
      //    terminal is "traversable" to the other terminal's layer (i.e. a
      //    plated hole or via / compatible via "layers")
      // 4. otherwise throw (for now)

      // This can be due to an undefined footprint or unmatched pcb_port, but
      // there should be an error earlier than this
      const invalid_terminal = terminals.find(
        (t) => t.x === undefined || t.y === undefined
      )
      if (invalid_terminal) {
        const source_port = parent_elements.find(
          (e) =>
            e.type === "source_port" &&
            e.source_port_id === (invalid_terminal as any).source_port_id
        ) as Type.SourcePort
        const source_component = parent_elements.find(
          (e) =>
            e.type === "source_component" &&
            e.source_component_id === source_port?.source_component_id
        ) as Type.SourceComponent
        pcb_errors.push({
          pcb_error_id: builder.project_builder.getId("pcb_error"),
          type: "pcb_error",
          error_type: "pcb_trace_error",
          message: `Terminal "${
            source_port?.name
              ? `.${source_component?.name} > .${source_port?.name}`
              : JSON.stringify(invalid_terminal)
          }" has no x/y coordinates, this may be due to a missing footprint or unmatched pcb port`,
          pcb_trace_id,
          source_trace_id,
          pcb_component_ids: [], // TODO
          pcb_port_ids: pcb_terminal_port_ids,
        })
        return []
      }

      const candidate_layers: Type.LayerRef[] = uniq(
        terminals.flatMap((t) => {
          if ("layers" in t) return t.layers
          if ("via_to_layer" in t && t["via_to_layer"]) return [t.via_to_layer]
          return []
        })
      )

      const common_layers = candidate_layers.filter((layer) =>
        terminals.every((t) => {
          if ("layers" in t) return t.layers.includes(layer)
          return true
        })
      )

      if (candidate_layers.length === 0) {
        pcb_errors.push({
          pcb_error_id: builder.project_builder.getId("pcb_error"),
          type: "pcb_error",
          error_type: "pcb_trace_error",
          message: `No layers specified for terminals`,
          pcb_trace_id,
          source_trace_id,
          pcb_component_ids: [], // TODO
          pcb_port_ids: pcb_terminal_port_ids,
        })
        return []
      }

      if (common_layers.length === 1) {
        return solveForSingleLayerRoute(
          terminals.map((t) => ({
            x: t.x,
            y: t.y,
          })),
          common_layers[0]
        )
      }

      if (common_layers.length === 0) {
        pcb_errors.push({
          pcb_error_id: builder.project_builder.getId("pcb_error"),
          type: "pcb_error",
          error_type: "pcb_trace_error",
          message: `Terminals are on different layers and no common layer could be resolved`,
          pcb_trace_id,
          source_trace_id,
          pcb_component_ids: [], // TODO
          pcb_port_ids: pcb_terminal_port_ids,
        })
        return []
      }

      const LAYER_SELECTION_PREFERENCE = ["top", "bottom", "inner1", "inner2"]

      for (const layer of common_layers) {
        if (LAYER_SELECTION_PREFERENCE.includes(layer)) {
          return solveForSingleLayerRoute(
            terminals.map((t) => ({
              x: t.x,
              y: t.y,
            })),
            layer
          )
        }
      }

      return solveForSingleLayerRoute(terminals, [...common_layers].sort()[0])
    }

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
      pcb_route.push(...solveForRoute(pcb_terminals))
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
        pcb_errors.push({
          pcb_error_id: builder.project_builder.getId("pcb_error"),
          type: "pcb_error",
          error_type: "pcb_trace_error",
          message: `No common layers could be resolved for terminals`,
          pcb_trace_id,
          source_trace_id,
          pcb_component_ids: [], // TODO
          pcb_port_ids: pcb_terminal_port_ids,
        })
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
          routes.push(solveForRoute([a, b]))
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
