import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"
import { SchematicComponent } from "index"

test("[smoke] netalias", async (t) => {
  const projectBuilder = await createProjectBuilder().add("net_alias", (nab) =>
    nab
      .setSourceProperties({
        net: "gnd",
      })
      .setSchematicCenter(2, 1)
  )

  const soup = await projectBuilder.build()

  const net_alias = soup.filter(
    (s) => s.type === "schematic_component"
  )?.[0] as SchematicComponent

  t.not(net_alias.size.width, 0)
  t.not(net_alias.size.height, 0)

  await logLayout("netalias", soup)
  t.pass()
})
