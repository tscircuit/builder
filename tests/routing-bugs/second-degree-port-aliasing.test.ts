import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("second degree port aliasing", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  // A resistor connected to a diode via a trace
  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        name: "R1",
        footprint: "0805",
        resistance: "1k",
        center: [0, 0],
        pcb_x: 0,
        pcb_y: 0,
      })
    )
    .add("diode", (rb) =>
      rb.setProps({
        name: "D1",
        footprint: "0805",
        center: [3, 0],
        pcb_x: 5,
        pcb_y: 0,
      })
    )
    .add("trace", (rb) =>
      rb.setProps({
        from: ".R1 > .right",
        to: ".D1 > .left",
      })
    )
    .build()

  await logSoup(soup)
  t.pass()
})
