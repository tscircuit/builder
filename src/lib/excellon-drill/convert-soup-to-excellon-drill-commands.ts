import { AnySoupElement } from "lib/soup"
import { AnyExcellonDrillCommand } from "./any-excellon-drill-command-map"
import { excellonDrill } from "./excellon-drill-builder"

export const mmToInch = (mm: number) => {
  return mm / 25.4
}

export const convertSoupToExcellonDrillCommands = ({
  soup,
  is_plated,
}: {
  soup: Array<AnySoupElement>
  is_plated: boolean
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
      text: "FORMAT={-:-/ absolute / inch / decimal}",
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
    .add("unit_format", { unit: "INCH", lz: null })

  let tool_counter = 10 // Start tool numbering from 10 for example

  const diameterToToolNumber: Record<number, number> = {}

  // Define tools
  for (const element of soup) {
    if (
      element.type === "pcb_plated_hole" ||
      element.type === "pcb_hole" ||
      element.type === "pcb_via"
    ) {
      if (!diameterToToolNumber[element.hole_diameter]) {
        builder.add("define_tool", {
          tool_number: tool_counter,
          diameter: mmToInch(element.hole_diameter),
        })
        diameterToToolNumber[element.hole_diameter] = tool_counter
        tool_counter++
      }
    }
  }

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
        if (diameterToToolNumber[element.hole_diameter] === i) {
          builder.add("drill_at", {
            x: mmToInch(element.x),
            y: mmToInch(element.y),
          })
        }
      }
    }
  }

  builder.add("M30", {})

  return builder.build()
}
