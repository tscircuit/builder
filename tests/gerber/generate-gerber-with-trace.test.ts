import test from "ava"
import { convertSoupToGerberCommands } from "lib/gerber/convert-soup-to-gerber-commands"
import { stringifyGerberCommands } from "lib/gerber/stringify-gerber"

test("Generate simple gerber with a single trace", async (t) => {
  const gerber_cmds = convertSoupToGerberCommands([
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
  ])
  console.log("Gerber")
  console.log("----------------------------------------------")
  console.log(stringifyGerberCommands(gerber_cmds.F_Cu))
  t.pass()
})
