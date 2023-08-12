import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"

test("[smoke] netalias", async (t) => {
  const projectBuilder = await createProjectBuilder().add("net_alias", (nab) =>
    nab
      .setSourceProperties({
        net: "gnd",
      })
      .setSchematicCenter(2, 1)
  )

  const projectBuilderOutput = await projectBuilder.build()

  await logLayout("netalias", projectBuilderOutput)
  t.pass()
})
