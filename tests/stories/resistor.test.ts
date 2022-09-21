import { createProjectBuilder } from "lib/builder"
import test from "ava"

test("build resistor project", async (t) => {
  const projectBuilder = await createProjectBuilder().addResistor((rb) =>
    rb
      .setSourceProperties({
        resistance: "10 ohm",
        name: "R1",
      })
      .setSchematicCenter(2, 1)
  )

  const projectBuilderOutput = await projectBuilder.build()

  t.snapshot(projectBuilderOutput)
})
