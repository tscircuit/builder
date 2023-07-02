import test from "ava"
import { createProjectBuilder } from "lib/builder/project-builder"
import { logLayout } from "../utils/log-layout"

test("sparkfun footprint 0805_RES", async (t) => {
  const projectBuilder = await createProjectBuilder().add("resistor", (rb) =>
    rb
      .setSourceProperties({
        resistance: "10 ohm",
        name: "R1",
      })
      .setSchematicCenter(2, 1)
      .setFootprint("0805")
  )

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("sparkfun_footprint:0805", projectBuilderOutput)
  t.snapshot(projectBuilderOutput)
})
