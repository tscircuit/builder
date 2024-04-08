import { AnySoupElement } from "lib/soup"
import { AnyGerberCommand } from "../any_gerber_command"
import { GerberJobJson } from "./gerber-job-json"
import { gerberBuilder } from "../gerber-builder"
import packageJson from "../../../../package.json"
import { pairs } from "lib/utils/pairs"

type LayerToGerberCommandsMap = {
  F_Cu: AnyGerberCommand[]
  F_SilkScreen: AnyGerberCommand[]
  F_Mask: AnyGerberCommand[]
  F_Paste: AnyGerberCommand[]
  B_Cu: AnyGerberCommand[]
  B_SilkScreen: AnyGerberCommand[]
  B_Mask: AnyGerberCommand[]
  B_Paste: AnyGerberCommand[]
  Edge_Cuts: AnyGerberCommand[]
  job?: GerberJobJson
}

/**
 * Returns headers for a Gerber file. Here's a typical header:
 *
 * %TF.GenerationSoftware,KiCad,Pcbnew,8.0.1*%
 * %TF.CreationDate,2024-04-08T11:14:22-07:00*%
 * %TF.ProjectId,,58585858-5858-4585-9858-585858585858,rev?*%
 * %TF.SameCoordinates,Original*%
 * %TF.FileFunction,Copper,L1,Top*%
 * %TF.FilePolarity,Positive*%
 * %FSLAX46Y46*%
 * G04 Gerber Fmt 4.6, Leading zero omitted, Abs format (unit mm)*
 * G04 Created by KiCad (PCBNEW 8.0.1) date 2024-04-08 11:14:22*
 * %MOMM*%
 * %LPD*%
 */
export const getCommandHeaders = (): AnyGerberCommand[] => {
  return (
    gerberBuilder()
      .add("add_attribute_on_file", {
        attribute_name: "GenerationSoftware",
        attribute_value: `tscircuit,builder,${packageJson.version}`,
      })
      .add("add_attribute_on_file", {
        attribute_name: "CreationDate",
        attribute_value: new Date().toISOString(),
      })
      // .add("add_attribute_on_file", {
      //   attribute_name: "ProjectId",
      //   attribute_value: "",
      // })
      .add("add_attribute_on_file", {
        attribute_name: "SameCoordinates",
        attribute_value: "Original",
      })
      .add("add_attribute_on_file", {
        attribute_name: "FileFunction",
        attribute_value: "Copper,L1,Top",
      })
      .add("format_specification", {})
      .add("comment", {
        comment: `Gerber Fmt 4.6, Leading zero omitted, Abs format (unit mm)`,
      })
      .add("comment", {
        comment: `Created by tscircuit (builder) date ${new Date().toISOString()}`,
      })
      .build()
  )
}

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
    B_Cu: [],
    B_SilkScreen: [],
    B_Mask: [],
    B_Paste: [],
    Edge_Cuts: [],
  }

  // TODO define aperatures for each trace width

  for (const layer of ["top", "bottom"]) {
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
              glayers.F_Cu.push(
                ...gerberBuilder()
                  .add("move_operation", { x: a.x, y: a.y })
                  .add("plot_operation", { x: b.x, y: b.y })
                  .build()
              )
            }
          }
        }
      } else if (element.type === "pcb_smtpad") {
      }
    }
  }

  for (const key of Object.keys(glayers)) {
    glayers[key].push(...gerberBuilder().add("end_of_file", {}).build())
  }

  return glayers
}
