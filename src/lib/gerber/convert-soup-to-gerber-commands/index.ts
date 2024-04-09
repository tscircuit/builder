import { AnySoupElement } from "lib/soup"
import type { LayerRef } from "lib/soup"
import { gerberBuilder } from "../gerber-builder"
import { pairs } from "lib/utils/pairs"
import { LayerToGerberCommandsMap } from "./GerberLayerName"
import { getAllTraceWidths } from "./getAllTraceWidths"
import { getGerberLayerName } from "./getGerberLayerName"
import { getCommandHeaders } from "./getCommandHeaders"
import { findApertureNumber } from "./findApertureNumber"
import {
  defineAperturesForLayer,
  getApertureConfigFromPcbSmtpad,
} from "./defineAperturesForLayer"
import { defineCommonMacros } from "./define-common-macros"

/**
 * Converts tscircuit soup to arrays of Gerber commands for each layer
 */
export const convertSoupToGerberCommands = (
  soup: AnySoupElement[]
): LayerToGerberCommandsMap => {
  const glayers: LayerToGerberCommandsMap = {
    F_Cu: getCommandHeaders(),
    F_SilkScreen: [],
    F_Mask: [],
    F_Paste: [],
    B_Cu: getCommandHeaders(),
    B_SilkScreen: [],
    B_Mask: [],
    B_Paste: [],
    Edge_Cuts: [],
  }

  for (const glayer_name of ["F_Cu", "B_Cu"] as const) {
    const glayer = glayers[glayer_name]
    defineCommonMacros(glayer)
    defineAperturesForLayer({
      soup,
      glayer,
      glayer_name,
    })
  }

  for (const layer of ["top", "bottom"] as const) {
    for (const element of soup) {
      if (element.type === "pcb_trace") {
        const { route } = element
        for (const [a, b] of pairs(route)) {
          // TODO b kind of matters here, this doesn't handle a bunch of cases
          // but the definition of a route is also kind of broken, a "wire" is
          // a relationship between two points and can't really be a type of
          // point
          if (a.route_type === "wire") {
            if (a.layer === layer) {
              const glayer = glayers[getGerberLayerName(layer, "copper")]
              glayer.push(
                ...gerberBuilder()
                  .add("select_aperture", {
                    aperture_number: findApertureNumber(glayer, {
                      trace_width: a.width,
                    }),
                  })
                  .add("move_operation", { x: a.x, y: a.y })
                  .add("plot_operation", { x: b.x, y: b.y })
                  .build()
              )
            }
          }
        }
      } else if (element.type === "pcb_smtpad") {
        if (element.layer === layer) {
          const glayer = glayers[getGerberLayerName(layer, "copper")]

          glayer.push(
            ...gerberBuilder()
              .add("select_aperture", {
                aperture_number: findApertureNumber(
                  glayer,
                  getApertureConfigFromPcbSmtpad(element)
                ),
              })
              .add("flash_operation", { x: element.x, y: element.y })
              .build()
          )
        }
      }
    }
  }

  for (const key of Object.keys(glayers)) {
    glayers[key].push(...gerberBuilder().add("end_of_file", {}).build())
  }

  return glayers
}
