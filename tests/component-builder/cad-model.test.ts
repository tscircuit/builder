import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("add cad_component when cadModel specified", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("board", (bb) =>
      bb
        .setProps({
          width: 10,
          height: 10,
          center_x: 0,
          center_y: 0,
        })
        .add("resistor", (rb) =>
          rb
            .setProps({
              resistance: 100,
              name: "R2",
              rotation: "90deg",
              cadModel: {
                stlUrl:
                  "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=84af7f0f6529479fb6b1c809c61d205f&pn=C95209",
              },
            })
            .setSchematicCenter(0, 2)
        )
    )
    .build()

  t.is(su(soup).cad_component.list().length, 1)
  t.is(su(soup).pcb_board.list().length, 1)

  await logSoup(soup)
  t.pass()
})
