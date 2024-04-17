import test from "ava"
import { stringifyExcellonDrill } from "lib/excellon-drill/stringify-excellon-drill"
import { excellonDrill } from "lib/excellon-drill/excellon-drill-builder"

test("test that we can recreate an example drill file", (t) => {
  const output_commands = excellonDrill()
    .add("M48", {})
    .add("header_comment", {
      text: "DRILL file {tscircuit} date 2024-04-09T20:34:41-0700",
    })
    .add("header_comment", {
      text: "FORMAT={-:-/ absolute / inch / decimal}",
    })
    .add("header_attribute", {
      attribute_name: "TF.CreationDate",
      attribute_value: "2024-04-09T20:34:41-07:00",
    })
    .add("header_attribute", {
      attribute_name: "TF.GenerationSoftware",
      attribute_value: "Kicad,Pcbnew,8.0.1",
    })
    .add("header_attribute", {
      attribute_name: "TF.FileFunction",
      attribute_value: "Plated,1,2,PTH",
    })
    .add("FMAT", { format: 2 })
    .add("unit_format", { unit: "INCH" })
    .add("header_attribute", {
      attribute_name: "TA.AperFunction",
      attribute_value: "Plated,PTH,ComponentDrill",
    })
    .add("define_tool", { tool_number: 1, diameter: 0.0394 })
    .add("rewind", {})
    .add("G90", {})
    .add("G05", {})
    .add("use_tool", { tool_number: 1 })
    .add("drill_at", { x: 4.9197, y: -2.9724 })
    .add("drill_at", { x: 5.0197, y: -2.9724 })
    .add("M30", {})
    .build()

  const output_text = stringifyExcellonDrill(output_commands)
  const target_output = `M48
  ; DRILL file {tscircuit} date 2024-04-09T20:34:41-0700
  ; FORMAT={-:-/ absolute / inch / decimal}
  ; #@! TF.CreationDate,2024-04-09T20:34:41-07:00
  ; #@! TF.GenerationSoftware,Kicad,Pcbnew,8.0.1
  ; #@! TF.FileFunction,Plated,1,2,PTH
  FMAT,2
  INCH
  ; #@! TA.AperFunction,Plated,PTH,ComponentDrill
  T1C0.039400
  %
  G90
  G05
  T1
  X4.9197Y-2.9724
  X5.0197Y-2.9724
  M30`

  const output_lines = output_text.split("\n")
  const target_lines = target_output.split("\n")

  for (let i = 0; i < output_lines.length; i++) {
    t.is(
      output_lines[i].trim(),
      target_lines[i].trim(),
      `Line ${i} did not match\n\nExpected:\n${target_lines
        .slice(i - 3, i + 1)
        .join("\n")}\n\nGot:\n${output_lines.slice(i - 3, i + 1).join("\n")}`
    )
  }
})
