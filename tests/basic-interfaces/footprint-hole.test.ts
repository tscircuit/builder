import test from "ava"
import { createProjectBuilder } from "lib/builder/project-builder"
import { logLayout } from "../utils/log-layout"
import { su } from "@tscircuit/soup-util"

test("footprint hole should be created", async (t) => {
  const projectBuilder = await createProjectBuilder().add(
    "generic_component",
    (gb) =>
      gb.footprint.add("platedhole", (ph) =>
        ph.setProps({
          shape: "circle",
          holeDiameter: "1mm",
          outerDiameter: "1.5mm",
          x: 0,
          y: 0,
        })
      )
  )

  const soup = await projectBuilder.build()

  const [plated_hole] = su(soup).pcb_plated_hole.list()
  if (plated_hole.shape !== "circle") throw new Error("not a circle")

  t.truthy(plated_hole.hole_diameter)
  t.truthy(plated_hole.outer_diameter)

  await logLayout("footprint-hole", soup)
  t.snapshot(soup)
})
