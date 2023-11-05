import test from "ava"
import * as Type from "lib/types"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

test("no traces through pcb pads", async (t) => {
  const result = await createProjectBuilder()
    .add("resistor", (bb) =>
      bb
        .setSourceProperties({ name: "R1", resistance: "10kohm" })
        .setFootprint("0805")
        .setFootprintCenter(0, 0)
        .setFootprintRotation("90deg")
        .setSchematicCenter(0, 0)
    )
    .add("resistor", (bb) =>
      bb
        .setSourceProperties({ name: "R2", resistance: "10kohm" })
        .setFootprint("0805")
        .setFootprintCenter(2, 0)
        .setFootprintRotation("90deg")
        .setSchematicCenter(2, 0)
    )
    .add("resistor", (bb) =>
      bb
        .setSourceProperties({ name: "R3", resistance: "10kohm" })
        .setFootprint("0805")
        .setFootprintCenter(4, 0)
        .setFootprintRotation("90deg")
        .setSchematicCenter(4, 0)
    )
    .add("trace", (tb) => tb.addConnections([".R1 > .left", ".R3 > .left"]))
    .build()

  await logLayout(`no traces through pcb pads`, result)
  t.pass()
})
