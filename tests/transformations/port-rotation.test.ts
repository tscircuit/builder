import { createProjectBuilder } from "lib/builder"
import test from "ava"
import { logLayout } from "../utils/log-layout"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"
import { AnySoupElement } from "@tscircuit/soup"

test("port rotation (facing_direction)", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb
        .setProps({
          name: "R1",
          resistance: "10 ohm",
        })
        .setSchematicCenter(0, 0)
        .setSchematicRotation(`90deg`)
        .setFootprint("0402")
    )
    .build()

  t.is(su(soup).schematic_port.select(".R1 > .right")?.facing_direction, "up")
  t.is(su(soup).schematic_port.select(".R1 > .left")?.facing_direction, "down")

  await logSoup(soup)
})
