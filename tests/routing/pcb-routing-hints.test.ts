import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("trace with pcb routing hints", async (t) => {
  const result = await createProjectBuilder()
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "1kohm",
          name: "R1",
        })
        .setFootprint("0805")
        .setSchematicCenter(0, 0)
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "1kohm",
          name: "R2",
        })
        .setFootprint("0805")
        .setSchematicCenter(3, 0)
        .setFootprintCenter(10, 0)
    )
    .add("trace", (tb) =>
      tb.addConnections([".R1 > port.right", ".R2 > port.left"]).setProps({
        pcb_route_hints: [
          {
            x: 3,
            y: -4,
          },
          {
            x: 6,
            y: 4,
          },
        ],
      })
    )
    .build()

  await logLayout("trace with pcb routing hints", result)
  t.pass()
})
