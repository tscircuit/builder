import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("add cad_component when cadModel specified 2", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("board", (bb) =>
      bb
        .setProps({
          width: 10,
          height: 10,
        })
        .add("resistor", (rb) =>
          rb
            .setProps({
              resistance: 100,
              name: "R2",
              rotation: "90deg",
              footprint: "0805",
              cadModel: {
                rotationOffset: "90deg",
                objUrl:
                  "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=c7acac53bcbc44d68fbab8f60a747688&pn=C17414",
              },
            })
            .setSchematicCenter(0, 2)
        )
        .add("resistor", (rb) =>
          rb.setProps({
            resistance: 1_000,
            name: "R1",
            pcb_x: 2,
            pcb_y: 2,
            footprint: "0805",
            pcbRotation: "90deg",
            cadModel: {
              objUrl:
                "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=c7acac53bcbc44d68fbab8f60a747688&pn=C17414",
            },
          })
        )
        .add("trace", (tb) =>
          tb.setProps({ from: ".R1 > .left", to: ".R2 > .right" })
        )
    )
    .build()

  t.is(su(soup).cad_component.list().length, 2)
  t.is(su(soup).pcb_board.list().length, 1)

  await logSoup(soup)
  t.pass()
})
