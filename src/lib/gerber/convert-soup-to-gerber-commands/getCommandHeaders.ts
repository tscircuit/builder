import { AnyGerberCommand } from "../any_gerber_command"
import { gerberBuilder } from "../gerber-builder"
import packageJson from "../../../../package.json"

const layerAndTypeToFileFunction = {
  "top-copper": "Copper,L1,Top",
  "bottom-copper": "Copper,L2,Bot",
  "top-soldermask": "Soldermask,Top",
  "bottom-soldermask": "Soldermask,Bot",
  "top-silkscreen": "Legend,Top",
  "bottom-silkscreen": "Legend,Bot",
  "top-paste": "Paste,Top",
  "bottom-paste": "Paste,Bot",
  edgecut: "Profile,NP",
  // TODO inner layers
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
export const getCommandHeaders = (opts: {
  layer:
    | "edgecut"
    | "top"
    | "bottom"
    | "inner1"
    | "inner2"
    | "inner3"
    | "inner4"
  layer_type?: "copper" | "soldermask" | "silkscreen" | "paste"
}): AnyGerberCommand[] => {
  const file_function =
    layerAndTypeToFileFunction[
      opts.layer_type ? `${opts.layer}-${opts.layer_type}` : opts.layer
    ]
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
        attribute_value: file_function,
      })
      .$if(opts.layer !== "edgecut", (gb) =>
        gb.add("add_attribute_on_file", {
          attribute_name: "FilePolarity",
          attribute_value:
            opts.layer_type === "soldermask" ? "Negative" : "Positive",
        })
      )
      .add("format_specification", {})
      .add("set_unit", {
        unit: "mm",
      })
      .add("comment", {
        comment: `Gerber Fmt 4.6, Leading zero omitted, Abs format (unit mm)`,
      })
      .add("comment", {
        comment: `Created by tscircuit (builder) date ${new Date().toISOString()}`,
      })
      .add("set_movement_mode_to_linear", {})
      .build()
  )
}
