import { getTestFixture } from "tests/fixtures/get-test-fixture"
import test from "ava"
import { layout } from "@tscircuit/layout"
import { PCBComponent, manual_layout } from "index"
import { su } from "@tscircuit/soup-util"

test("pcb manual layout in group builder", async (t) => {
  const { logSoup, pb } = getTestFixture(t)

  const soup = await pb
    .setProps({
      layout: layout().manualPcbPlacement([
        {
          selector: ".R1",
          center: {
            x: -10,
            y: 10,
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

  t.deepEqual(pcb_component.center, { x: -10, y: 10 })

  // Check that the port also moved
  const pcb_ports = su(soup).pcb_port.list({
    pcb_component_id: pcb_component.pcb_component_id,
  })

  t.is(pcb_ports?.length, 2)

  t.truthy(pcb_ports?.every((p) => Math.abs(p.x - -10) < 2))
})
