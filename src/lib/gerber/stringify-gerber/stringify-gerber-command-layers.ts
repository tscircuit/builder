import { AnyGerberCommand } from "../any_gerber_command"
import { GerberLayerName } from "../convert-soup-to-gerber-commands/GerberLayerName"
import { stringifyGerberCommand } from "./stringify-gerber-command"

export const stringifyGerberCommandLayers = (
  commandLayers: Record<GerberLayerName, AnyGerberCommand[]>
): Record<GerberLayerName, string> => {
  const stringifiedCommandLayers: Record<GerberLayerName, string> = {} as any
  for (const layerName of Object.keys(commandLayers) as GerberLayerName[]) {
    stringifiedCommandLayers[layerName] = commandLayers[layerName]
      .map((command) => {
        return stringifyGerberCommand(command)
      })
      .join("\n")
  }
  return stringifiedCommandLayers
}
