import test from "ava"
import { createProjectBuilder } from "lib/builder/project-builder"
import { logLayout } from "../utils/log-layout"

test("footprint hole should be created", async (t) => {
  const projectBuilder = await createProjectBuilder().add(
    "generic_component",
    (gb) =>
      gb.footprint.add("platedhole", (ph) =>
        ph.setProps({
          inner_diameter: "1mm",
          outer_diameter: "1.5mm",
          x: 0,
          y: 0,
        })
      )
  )

  const soup = await projectBuilder.build()

  await logLayout("footprint-hole", soup)
  t.snapshot(soup)
})
