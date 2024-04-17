import test from "ava"
import { convertSoupToGerberCommands } from "lib/gerber/convert-soup-to-gerber-commands"
import {
  stringifyGerberCommandLayers,
  stringifyGerberCommands,
} from "lib/gerber/stringify-gerber"
import { maybeOutputGerber } from "tests/fixtures/maybe-output-gerber"

// If you're trying to test this, I would recommend opening up Kicad's Gerber
// Viewer and loading in the files from the generated directory "gerber-output"
// that's produced if OUTPUT_GERBER=1 when you do `npx ava ./tests/gerber/generate-gerber-with-trace.test.ts`
// You can generate the files then hit reload in the Gerber Viewer to see that
// everything looks approximately correct
test("Generate simple gerber with basic elements", async (t) => {
  const gerber_cmds = convertSoupToGerberCommands([
    {
      type: "pcb_board",
      width: 20,
      height: 20,
      center: { x: 0, y: 0 },
    },
    {
      type: "pcb_trace",
      source_trace_id: "source_trace_1",
      pcb_trace_id: "pcb_trace_1",
      route: [
        {
          x: 0,
          y: 0,
          width: 0.1,
          route_type: "wire",
          layer: "top",
        },
        {
          x: 1,
          y: 0,
          width: 0.1,
          route_type: "wire",
          layer: "top",
        },
      ],
    },
    {
      pcb_smtpad_id: "smtpad_1",
      type: "pcb_smtpad",
      shape: "rect",
      height: 1,
      width: 1,
      x: 1,
      y: 1,
      layer: "top",
    },
    {
      pcb_smtpad_id: "smtpad_2",
      type: "pcb_smtpad",
      shape: "rect",
      height: 1,
      width: 1,
      x: 2,
      y: -1,
      layer: "bottom",
    },
    {
      type: "pcb_plated_hole",
      x: 4,
      y: 1,
      hole_diameter: 0.8,
      layers: ["top", "bottom"],
      outer_diameter: 2,
    },
  ])
  const fu_cp = stringifyGerberCommands(gerber_cmds.F_Cu)
  // console.log("Gerber")
  // console.log("----------------------------------------------")
  // console.log(fu_cp)
  console.log(stringifyGerberCommands(gerber_cmds.B_Mask))

  // TODO parse gerber to check for correctness

  await maybeOutputGerber(stringifyGerberCommandLayers(gerber_cmds))
  t.pass()
})
