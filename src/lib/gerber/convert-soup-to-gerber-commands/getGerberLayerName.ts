import type { LayerRef } from "@tscircuit/soup"
import type { GerberLayerName } from "./GerberLayerName"

const layerRefToGerberPrefix = {
  top: "F_",
  bottom: "B_",
} as const
const layerTypeToGerberSuffix = {
  copper: "Cu",
  silkscreen: "SilkScreen",
  soldermask: "Mask",
  mask: "Mask",
  paste: "Paste",
} as const

export const getGerberLayerName = (
  layer_ref: LayerRef | "edgecut",
  layer_type: "copper" | "silkscreen" | "soldermask" | "paste"
): GerberLayerName => {
  if (layer_ref === "edgecut") return "Edge_Cuts"
  return `${layerRefToGerberPrefix[layer_ref]}${layerTypeToGerberSuffix[layer_type]}` as any
}
