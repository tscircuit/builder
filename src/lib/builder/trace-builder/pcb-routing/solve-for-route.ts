import type {
  LayerRef,
  PCBPort,
  PCBTrace,
  PcbRouteHint,
  SourcePort,
} from "@tscircuit/soup"
import type { TracePcbRoutingContext } from "./trace-pcb-routing-context"
import { SourceComponent } from "lib/types"
import { uniq } from "lib/utils/uniq"
import { solveForSingleLayerRoute } from "./solve-for-single-layer-route"
import {
  createNoLayersSpecifiedError,
  createPcbTraceError,
} from "../pcb-errors"

export function solveForRoute(
  terminals: Array<PCBPort | PcbRouteHint>,
  ctx: TracePcbRoutingContext
): PCBTrace["route"] {
  // 1. if all terminals are on the same layer, solve
  // 2. if some terminals have layer unspecified but at least one does, and
  //    there are no disagreeing layers, solve
  // 3. if this is a terminal pair and it's across two layers, check if one
  //    terminal is "traversable" to the other terminal's layer (i.e. a
  //    plated hole or via / compatible via "layers")
  // 4. otherwise throw (for now)

  const { elements, mutable_pcb_errors: pcb_errors } = ctx

  // This can be due to an undefined footprint or unmatched pcb_port, but
  // there should be an error earlier than this
  const invalid_terminal = terminals.find(
    (t) => t.x === undefined || t.y === undefined
  )
  if (invalid_terminal) {
    const source_port = elements.find(
      (e) =>
        e.type === "source_port" &&
        e.source_port_id === (invalid_terminal as any).source_port_id
    ) as SourcePort
    const source_component = elements.find(
      (e) =>
        e.type === "source_component" &&
        e.source_component_id === source_port?.source_component_id
    ) as SourceComponent
    pcb_errors.push(
      createPcbTraceError(
        `Terminal "${
          source_port?.name
            ? `.${source_component?.name} > .${source_port?.name}`
            : JSON.stringify(invalid_terminal)
        }" has no x/y coordinates, this may be due to a missing footprint or unmatched pcb port`,
        ctx
      )
    )
    return []
  }

  const candidate_layers: LayerRef[] = uniq(
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
    pcb_errors.push(createNoLayersSpecifiedError(ctx))
    return []
  }

  if (common_layers.length === 1) {
    return solveForSingleLayerRoute(
      {
        terminals: terminals.map((t) => ({
          x: t.x,
          y: t.y,
        })),
        layer: common_layers[0],
      },
      ctx
    )
  }

  if (common_layers.length === 0) {
    pcb_errors.push(
      createPcbTraceError(
        "Terminals are on different layers and no common layer could be resolved",
        ctx
      )
    )
    return []
  }

  const LAYER_SELECTION_PREFERENCE = ["top", "bottom", "inner1", "inner2"]

  for (const layer of common_layers) {
    if (LAYER_SELECTION_PREFERENCE.includes(layer)) {
      return solveForSingleLayerRoute(
        {
          terminals: terminals.map((t) => ({
            x: t.x,
            y: t.y,
          })),
          layer: layer,
        },
        ctx
      )
    }
  }

  return solveForSingleLayerRoute(
    {
      terminals,
      layer: [...common_layers].sort()[0],
    },
    ctx
  )
}
