import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("trace with schematic routing hints", async (t) => {
  // Add two resistors, add a trace between them, give a hint that the trace must
  // follow

  const result = await createProjectBuilder()
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "1kohm",
          name: "R1",
        })
        .setSchematicCenter(0, 0)
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "1kohm",
          name: "R2",
        })
        .setSchematicCenter(3, 0)
    )
    .add("trace", (tb) =>
      tb.addConnections([".R1 > port.right", ".R2 > port.left"]).setProps({
        schematic_route_hints: [
          {
            x: 1,
            y: -2,
          },
          {
            x: 2,
            y: 2,
          },
        ],
      })
    )
    .build()

  await logLayout("trace with schematic routing hints", result)
  t.pass()
})
