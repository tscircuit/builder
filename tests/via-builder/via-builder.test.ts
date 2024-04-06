import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] via builder", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("via", (vb) =>
      vb.setProps({
        center: [0, 0],
        name: "V1",
        from_layer: "top",
        to_layer: "bottom",
        hole_diameter: "0.2mm",
        outer_diameter: "0.5mm",
      })
    )
    .add("resistor", (rb) =>
      rb.setProps({
        x: -2,
        y: 0,
        pcb_x: -2,
        pcb_y: 0,
        resistance: "1k",
        name: "R1",
        footprint: "0402",
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
      })
    )
    .add("trace", (tb) =>
      tb.setProps({
        path: [".R1 > .right", ".V1 > .top"],
      })
    )
    .add("trace", (tb) =>
      tb.setProps({
        path: [".V1 > .bottom", ".R2 > .left"],
      })
    )
    .build()

  await logSoup(soup)
  t.pass()
})
