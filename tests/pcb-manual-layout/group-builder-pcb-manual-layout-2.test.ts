import { getTestFixture } from "tests/fixtures/get-test-fixture"
import test from "ava"
import { layout } from "@tscircuit/layout"
import { PCBComponent, manual_layout } from "index"

test("pcb manual layout in group builder", async (t) => {
  const { logSoup, pb } = getTestFixture(t)

  const soup = await pb
    .setProps({
      layout: layout().manualPcbPlacement([
        {
          selector: ".R1",
          center: {
            x: -1,
            y: 1,
          },
        },
      ]),
    })
    .add("resistor", (rb) =>
      rb.setProps({
        resistance: "10k",
        name: "R1",
        footprint: "0805",
      })
    )
    .build()

  const pcb_component = soup.find(
    (e) => e.type === "pcb_component"
  )! as PCBComponent

  t.deepEqual(pcb_component.center, { x: -1, y: 1 })
})
