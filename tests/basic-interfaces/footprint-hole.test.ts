import test from "ava"
import { createProjectBuilder } from "lib/builder/project-builder"
import { logLayout } from "../utils/log-layout"

test("footprint hole should be created", async (t) => {
  const projectBuilder = await createProjectBuilder().add(
    "generic_component",
    (gb) =>
      gb.footprint.add("smtpad", (sp) =>
        sp.setShape("rect").setPosition(0, 0).setLayer("top").setSize(1, 1)
      )
  )

  const soup = await projectBuilder.build()

  await logLayout("footprint-hole", soup)
  t.snapshot(soup)
})
