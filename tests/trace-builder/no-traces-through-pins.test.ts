import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"

test("no-traces-through-pins", async (t) => {
  const projectBuilder = await createProjectBuilder()
    .add("diode", (db) =>
      db
        .setSourceProperties({
          name: "D1",
        })
        .setSchematicRotation("180deg")
        .setSchematicCenter(0, -2)
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({ resistance: "1kohm", name: "R1" })
        .setSchematicCenter(0, 2)
    )
    .add("trace", (tb) => tb.addConnections([".R1 > .right", ".D1 > .left"]))
    .add("resistor", (rb) => rb.setSchematicCenter(0, 0))

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("no-traces-through-pins", projectBuilderOutput)
  t.pass()
})
