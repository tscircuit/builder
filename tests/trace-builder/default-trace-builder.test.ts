import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"

test("default-trace-builder", async (t) => {
  const projectBuilder = await createProjectBuilder()
    .add("diode", (db) =>
      db
        .setSourceProperties({
          name: "D1",
        })
        .setSchematicCenter(2, 1)
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({ resistance: "1kohm", name: "R1" })
        .setSchematicCenter(0, 0)
    )
    .add(
      "trace",
      (tb) => tb.addConnections([".R1 > .right", ".D1 > .left"])
      // .setRouteSolver("route1")
    )

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("default-trace-builder", projectBuilderOutput)
  t.pass()
})
