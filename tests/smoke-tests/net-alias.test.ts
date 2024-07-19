import test from "ava"
import type { SchematicComponent } from "@tscircuit/soup"
import { createProjectBuilder } from "lib/builder"
import { logLayout } from "../utils/log-layout"

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
