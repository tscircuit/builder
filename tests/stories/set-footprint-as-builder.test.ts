import test from "ava"
import { createFootprintBuilder, createProjectBuilder } from "lib/builder"
import { logLayout } from "../utils/log-layout"

test("set footprint as builder", async (t) => {
  const pb = await createProjectBuilder()

  pb.add("diode", (db) =>
    db.setProps({
      footprint: createFootprintBuilder(pb).add("smtpad", (sp) =>
        sp.setShape("rect").setSize(1, 1).setPosition(0, 0)
      ),
    })
  )

  const soup = await pb.build()

  logLayout("set footprint as builder", soup)
  t.truthy(soup.some((elm) => elm.type === "pcb_smtpad"))
})
