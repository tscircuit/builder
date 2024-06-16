import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("route to nets", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb
        // .setProps({
        //     resistance: "10 ohm",
        //     name: "R1",
        //   })
        .setSourceProperties({
          resistance: "10 ohm",
          name: "R1",
        })
        .setSchematicCenter("2mm", 1)
        .setFootprint("0402")
    )
    .add("resistor", (rb) =>
      rb
        // .setProps({
        //     resistance: "10 ohm",
        //     name: "R2",
        //     pcbX: "10mm",
        //     pcbY: "0mm",
        //   })
        .setSourceProperties({
          resistance: "10 ohm",
          name: "R2",
        })
        .setSchematicCenter("2mm", 1)
        .setFootprintCenter("10mm", 0)
        .setFootprint("0402")
    )
    .add("net", (nb) => nb.setProps({ name: "N1" }))
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R1 > .right",
        to: ".N1",
      })
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R2 > .left",
        to: ".N1",
      })
    )
    .build()

  await logSoup(soup)
  t.pass()
})
