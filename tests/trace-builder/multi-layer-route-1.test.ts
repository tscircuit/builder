import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("multi-layer route 1", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        x: -2,
        y: 0,
        pcb_x: -2,
        pcb_y: 0,
        resistance: "1k",
        name: "R1",
        footprint: "0402",
        pcb_layer: "top",
      })
    )
    .add("resistor", (rb) =>
      rb.setProps({
        x: 2,
        y: 0,
        pcb_x: 2,
        pcb_y: 0,
        resistance: "10k",
        name: "R2",
        footprint: "0402",
        pcb_layer: "bottom",
      })
    )
    .add("trace", (tb) =>
      tb.setProps({
        path: [".R1 > .right", ".R2 > .left"],
        pcb_route_hints: [
          {
            x: 0,
            y: 0,
            via: true,
          },
        ],
      })
    )
    .build()

  await logSoup(soup)
  t.pass()
})
