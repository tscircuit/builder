import test from "ava"
import { su } from "@tscircuit/soup-util"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("no traces through net labels", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({ resistance: 100, name: "R1" }).setSchematicCenter(-1, 0)
    )
    .add("resistor", (rb) =>
      rb
        .setProps({ resistance: 100, name: "R2", rotation: "90deg" })
        .setSchematicCenter(0, 2)
    )
    .add("resistor", (rb) =>
      rb
        .setProps({ resistance: 100, name: "R3", rotation: "-90deg" })
        .setSchematicCenter(0, -2)
    )
    .add("trace", (tb) =>
      tb.setProps({ from: ".R1 > .right", to: "net.LONGLONG" })
    )
    .add("trace", (tb) =>
      tb.setProps({ from: ".R2 > .left", to: ".R3 > .left" })
    )
    .build()
  await logSoup(soup)
  t.pass()
})
