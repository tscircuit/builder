import test from "ava"
import { createProjectBuilder } from "lib/builder/project-builder"
import { logLayout } from "../utils/log-layout"

test("sparkfun_resistor_traces", async (t) => {
  const projectBuilder = await createProjectBuilder()
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "10 ohm",
          name: "R1",
        })
        .setSchematicCenter(2, 1)
        .setFootprint("0805")
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "10 ohm",
          name: "R2",
        })
        .setSchematicCenter(5, 1)
        .setFootprintCenter(3, 1)
        .setFootprintRotation("90deg")
        .setFootprint("0603")
    )
    .add("trace", (tb) => tb.addConnections([".R1 > .right", ".R2 > .left"]))

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("sparkfun_resistor_traces", projectBuilderOutput)
  t.snapshot(projectBuilderOutput)
})
