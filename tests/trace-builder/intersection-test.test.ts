import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"

test("intersection test", async (t) => {
  const projectBuilder = await createProjectBuilder()
    .add("diode", (db) =>
      db
        .setSourceProperties({
          name: "D1",
        })
        .setSchematicRotation("180deg")
        .setSchematicCenter(-2, 2)
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({ resistance: "1kohm", name: "R1" })
        .setSchematicCenter(0, 0)
    )
    .add("trace", (tb) => tb.addConnections([".R1 > .right", ".D1 > .left"]))
    .add(
      "resistor",
      (rb) => rb.setSchematicCenter(-0.5, 1) //.setSchematicRotation("-90deg")
    )
    .add(
      "resistor",
      (rb) => rb.setSchematicCenter(1, 1) //.setSchematicRotation("-90deg")
    )

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("intersection test", projectBuilderOutput)
  t.pass()
})
