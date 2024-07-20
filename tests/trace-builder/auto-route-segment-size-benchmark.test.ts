import { schematicPortArrangement } from "@tscircuit/props"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("auto route segment size benchmark", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  // Two components with interconnections, on the left is a fine-pitched TSSOP
  // and on the right is a fine-pitched BGA

  const soup = await pb
    .add("board", (board) =>
      board
        .setProps({
          width: 10,
          height: 10,
        })
        .add("bug", (bb) =>
          bb.setProps({
            name: "U1",
            footprint: "tssop12_p0.65mm_pw0.35mm_pl2.05mm_w9.05mm",
            pcbX: -6,
            pcbY: 0,
          })
        )
        .add("bug", (bb) =>
          bb.setProps({
            name: "U2",
            footprint: "bga16",
            pcbX: 6,
            pcbY: 0,
          })
        )
        .add("trace", (tb) =>
          tb.setProps({ from: ".U1 > port.10", to: ".U2 > port.B3" })
        )
    )
    .build()

  await logSoup(soup)
  t.pass()
})
