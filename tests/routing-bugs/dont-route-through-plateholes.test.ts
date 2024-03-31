import test from "ava"
import { FootprintBuilder } from "index"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

const axial = (fb: FootprintBuilder) =>
  fb
    .add("platedhole", (pb) =>
      pb.setProps({
        x: "-0.05in",
        y: 0,
        hole_diameter: 0.8,
        inner_diameter: 1.0,
        outer_diameter: 1.2,
        port_hints: ["left"],
      })
    )
    .add("platedhole", (pb) =>
      pb.setProps({
        x: "0.05in",
        y: 0,
        hole_diameter: 0.8,
        inner_diameter: 1.0,
        outer_diameter: 1.2,
        port_hints: ["right"],
      })
    )

test("don't route through plated holes", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  // three resistors, each with a plated holes as footprint
  const soup = await pb
    .add("resistor", (rb) =>
      rb
        .setProps({
          name: "R1",
          resistance: "10k",
          center: [0, 0],
        })
        .modifyFootprint(axial)
    )
    .add("resistor", (rb) =>
      rb
        .setProps({
          name: "R2",
          resistance: "10k",
          center: [0, 0],
          pcb_x: 10,
          pcb_y: 0,
        })
        .modifyFootprint(axial)
    )
    .add("resistor", (rb) =>
      rb
        .setProps({
          name: "R3",
          resistance: "10k",
          center: [0, 0],
          pcb_x: 5,
          pcb_y: "0.05in",
          pcb_rotation: "90deg",
        })
        .modifyFootprint(axial)
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R1 > .right",
        to: ".R2 > .left",
      })
    )
    .build()

  await logSoup(soup)
  t.pass()
})
