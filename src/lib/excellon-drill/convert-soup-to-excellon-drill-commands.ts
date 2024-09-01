import type { AnySoupElement } from "@tscircuit/soup"
import type { AnyExcellonDrillCommand } from "./any-excellon-drill-command-map"
import { excellonDrill } from "./excellon-drill-builder"

export const inchToMm = (mm: number) => {
  return mm * 25.4
}

export const convertSoupToExcellonDrillCommands = ({
  soup,
  is_plated,
  flip_y_axis = false,
}: {
  soup: Array<AnySoupElement>
  is_plated: boolean
  flip_y_axis?: boolean
}): Array<AnyExcellonDrillCommand> => {
  const builder = excellonDrill()

  // Start sequence commands
  builder.add("M48", {})

  // Add header comments
  const date_str = new Date().toISOString()
  builder
    .add("header_comment", {
      text: `DRILL file {tscircuit} date ${date_str}`,
    })
    .add("header_comment", {
      text: "FORMAT={-:-/ absolute / metric / decimal}",
    })
    .add("header_attribute", {
      attribute_name: "TF.CreationDate",
      attribute_value: date_str,
    })
    .add("header_attribute", {
      attribute_name: "TF.GenerationSoftware",
      attribute_value: "tscircuit",
    })
    .add("header_attribute", {
      attribute_name: "TF.FileFunction",
      attribute_value: "Plated,1,2,PTH",
    })
    .add("FMAT", { format: 2 }) // Assuming format 2 for the example
    .add("unit_format", { unit: "METRIC", lz: null })

  let tool_counter = 10 // Start tool numbering from 10 for example

  const diameterToToolNumber: Record<number, number> = {}

  // Define tools
  for (const element of soup) {
    if (
      element.type === "pcb_plated_hole" ||
      element.type === "pcb_hole" ||
      element.type === "pcb_via"
    ) {
      if (!("hole_diameter" in element)) continue
      if (!diameterToToolNumber[element.hole_diameter]) {
        builder.add("aper_function_header", {
          is_plated: true,
        })
        builder.add("define_tool", {
          tool_number: tool_counter,
          diameter: inchToMm(element.hole_diameter),
        })
        diameterToToolNumber[element.hole_diameter] = tool_counter
        tool_counter++
      }
    }
  }

  builder.add("percent_sign", {})
  builder.add("G90", {})
  builder.add("G05", {})

  // Execute drills for tool N
  for (let i = 10; i < tool_counter; i++) {
    builder.add("use_tool", { tool_number: i })
    for (const element of soup) {
      if (
        element.type === "pcb_plated_hole" ||
        element.type === "pcb_hole" ||
        element.type === "pcb_via"
      ) {
        if (is_plated && element.type === "pcb_hole") continue
        if (
          !is_plated &&
          (element.type === "pcb_plated_hole" || element.type === "pcb_via")
        )
          continue
        if (!("hole_diameter" in element)) continue
        if (diameterToToolNumber[element.hole_diameter] === i) {
          builder.add("drill_at", {
            x: inchToMm(element.x),
            y: inchToMm(element.y) * (flip_y_axis ? -1 : 1),
          })
        }
      }
    }
  }

  builder.add("M30", {})

  return builder.build()
}
