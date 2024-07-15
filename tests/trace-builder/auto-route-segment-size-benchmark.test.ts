import { schematicPortArrangement } from "@tscircuit/props"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("auto route segment size benchmark", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  // Two components with interconnections, on the left is a fine-pitched TSSOP
  // and on the right is a fine-pitched BGA

  const soup = await pb
    .add("bug", (bb) =>
      bb.setProps({
        name: "U1",
        footprint: "tssop12",
        pcbX: -10,
        pcbY: 0,
        schPortArrangement: { leftSize: 3, rightSize: 3 },
        pinLabels: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F" },
      })
    )
    .add("bug", (bb) =>
      bb.setProps({
        name: "U2",
        footprint: "bga16",
        pcbX: 10,
        pcbY: 0,
        schPortArrangement: {
          leftSize: 4,
          rightSize: 4,
          topSize: 4,
          bottomSize: 4,
        },
        pinLabels: {
          1: "A",
          2: "B",
          3: "C",
          4: "D",
          5: "E",
          6: "F",
          7: "G",
          8: "H",
          9: "I",
          10: "J",
          11: "K",
          12: "L",
          13: "M",
          14: "N",
          15: "O",
          16: "P",
        },
      })
    )
    .add("trace", (tb) => tb.setProps({ from: ".U1 > port.5", to: ".U2 > .1" }))
    .build()

  await logSoup(soup)
  t.pass()
})
