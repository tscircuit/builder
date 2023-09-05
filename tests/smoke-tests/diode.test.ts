import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"

test("[smoke] diode", async (t) => {
  const projectBuilder = await createProjectBuilder().add("diode", (db) =>
    db
      .setSourceProperties({
        name: "D1",
      })
      .setSchematicCenter(2, 1)
  )

  const projectBuilderOutput = await projectBuilder.build()

  const srcComp: any = projectBuilderOutput.find(
    (e) => e.type === "source_component"
  )

  t.is(srcComp.name, "D1")
  t.is(srcComp.ftype, "simple_diode")

  await logLayout("diode", projectBuilderOutput)
  t.pass()
})
