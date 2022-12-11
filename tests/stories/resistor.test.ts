import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"

test("build resistor project", async (t) => {
  const projectBuilder = await createProjectBuilder().add("resistor", (rb) =>
    rb
      .setSourceProperties({
        resistance: "10 ohm",
        name: "R1",
      })
      .setSchematicCenter(2, 1)
      .setFootprint("0402")
  )

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("resistor", projectBuilderOutput)
  t.snapshot(projectBuilderOutput)
})
