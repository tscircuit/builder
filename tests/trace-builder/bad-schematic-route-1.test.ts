import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("bad schematic route 1", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: 100,
        name: "R1",
        rotation: "90deg",
        schX: -2,
        schY: -2,
      })
    )
    .add("bug", (bb) =>
      bb.setProps({
        name: "U1",
        port_arrangement: {
          left_size: 1,
          right_size: 1,
        },
        port_labels: {
          1: "A",
          2: "B",
        },
      })
    )
    .add("trace", (tb) => tb.setProps({ from: ".R1 > .left", to: ".U1 > .A" }))
    .build()

  await logSoup(soup)
  t.pass()
})
