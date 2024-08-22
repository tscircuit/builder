import type { AnySoupElement } from "@tscircuit/soup"
import { pairs } from "lib/utils/pairs"
import { gerberBuilder } from "../gerber-builder"
import type { LayerToGerberCommandsMap } from "./GerberLayerName"
import {
  defineAperturesForLayer,
  getApertureConfigFromCirclePcbPlatedHole,
  getApertureConfigFromPcbSmtpad,
} from "./defineAperturesForLayer"
import { findApertureNumber } from "./findApertureNumber"
import { getCommandHeaders } from "./getCommandHeaders"
import { getGerberLayerName } from "./getGerberLayerName"

/**
 * Converts tscircuit soup to arrays of Gerber commands for each layer
 */
export const convertSoupToGerberCommands = (
  soup: AnySoupElement[],
  opts: { flip_y_axis?: boolean } = {}
): LayerToGerberCommandsMap => {
  opts.flip_y_axis ??= false
  const glayers: LayerToGerberCommandsMap = {
    F_Cu: getCommandHeaders({
      layer: "top",
      layer_type: "copper",
    }),
    F_SilkScreen: [],
    F_Mask: getCommandHeaders({
      layer: "top",
      layer_type: "soldermask",
    }),
    F_Paste: [],
    B_Cu: getCommandHeaders({
      layer: "bottom",
      layer_type: "copper",
    }),
    B_SilkScreen: [],
    B_Mask: getCommandHeaders({
      layer: "bottom",
      layer_type: "soldermask",
    }),
    B_Paste: [],
    Edge_Cuts: getCommandHeaders({
      layer: "edgecut",
    }),
  }

  for (const glayer_name of ["F_Cu", "B_Cu", "F_Mask", "B_Mask"] as const) {
    const glayer = glayers[glayer_name]
    // defineCommonMacros(glayer)
    defineAperturesForLayer({
      soup,
      glayer,
      glayer_name,
    })
  }

  // Edgecuts has a single aperature
  glayers["Edge_Cuts"].push(
    ...gerberBuilder()
      .add("define_aperture_template", {
        aperture_number: 10,
        standard_template_code: "C",
        diameter: 0.05, //mm
      })
      .build()
  )

  /**
   * "maybe flip y axis" to handle y axis negating
   */
  const mfy = (y: number) => (opts.flip_y_axis ? -y : y)

  for (const layer of ["top", "bottom", "edgecut"] as const) {
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
                  .add("move_operation", { x: a.x, y: mfy(a.y) })
                  .add("plot_operation", { x: b.x, y: mfy(b.y) })
                  .build()
              )
            }
          }
        }
      } else if (element.type === "pcb_smtpad") {
        if (element.layer === layer) {
          for (const glayer of [
            glayers[getGerberLayerName(layer, "copper")],
            glayers[getGerberLayerName(layer, "soldermask")],
          ]) {
            glayer.push(
              ...gerberBuilder()
                .add("select_aperture", {
                  aperture_number: findApertureNumber(
                    glayer,
                    getApertureConfigFromPcbSmtpad(element)
                  ),
                })
                .add("flash_operation", { x: element.x, y: mfy(element.y) })
                .build()
            )
          }
        }
      } else if (element.type === "pcb_plated_hole") {
        if (element.layers.includes(layer as any)) {
          for (const glayer of [
            glayers[getGerberLayerName(layer, "copper")],
            glayers[getGerberLayerName(layer, "soldermask")],
          ]) {
            if (element.shape !== "circle") {
              console.warn(
                "NOT IMPLEMENTED: drawing gerber for non-circle plated hole"
              )
              continue
            }
            glayer.push(
              ...gerberBuilder()
                .add("select_aperture", {
                  aperture_number: findApertureNumber(
                    glayer,
                    getApertureConfigFromCirclePcbPlatedHole(element)
                  ),
                })
                .add("flash_operation", { x: element.x, y: mfy(element.y) })
                .build()
            )
          }
        }
      } else if (element.type === "pcb_board" && layer === "edgecut") {
        const glayer = glayers.Edge_Cuts
        const { width, height, center } = element
        glayer.push(
          ...gerberBuilder()
            .add("select_aperture", {
              aperture_number: 10,
            })
            .add("move_operation", {
              x: center.x - width / 2,
              y: mfy(center.y - height / 2),
            })
            .add("plot_operation", {
              x: center.x + width / 2,
              y: mfy(center.y - height / 2),
            })
            // .add("move_operation", {
            //   x: center.x + width / 2,
            //   y: center.y - height / 2,
            // })
            .add("plot_operation", {
              x: center.x + width / 2,
              y: mfy(center.y + height / 2),
            })
            // .add("move_operation", {
            //   x: center.x + width / 2,
            //   y: center.y + height / 2,
            // })
            .add("plot_operation", {
              x: center.x - width / 2,
              y: mfy(center.y + height / 2),
            })
            // .add("move_operation", {
            //   x: center.x - width / 2,
            //   y: center.y + height / 2,
            // })
            .add("plot_operation", {
              x: center.x - width / 2,
              y: mfy(center.y - height / 2),
            })
            .build()
        )
      }
    }
  }

  for (const key of Object.keys(glayers)) {
    glayers[key].push(...gerberBuilder().add("end_of_file", {}).build())
  }

  return glayers
}
