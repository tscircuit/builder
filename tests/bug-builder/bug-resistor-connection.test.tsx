import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("bug that has a footprint and connects to a resistor", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
        .setSourceProperties({ name: "B1" })
        .setSchematicProperties({
          port_arrangement: {
            left_size: 3,
            right_size: 3,
          },
        })
        .setFootprint("sot236")
        .labelPort(1, "D0")
        .labelPort(2, "D1")
        .setSchematicCenter(0, 0)
    )
    .add("resistor", (bb) =>
      bb
        .setSourceProperties({ name: "R1" })
        .setFootprint("0805")
        .setFootprintCenter(-4, 0)
        .setSchematicCenter(-2, -0.5)
    )
    .add("trace", (tb) => tb.addConnections([".B1 > .D0", ".R1 > .right"]))
    .build()

  await logLayout(`bug connected to resistor`, result)
  t.pass()
})
