import test from "ava"
import { getTestFixture } from "../fixtures/get-test-fixture"

test("bug with footprint and cad with translation", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("board", (board) =>
      board
        .setProps({
          center_x: 0,
          center_y: 0,
          width: 10,
          height: 10,
        })
        .add("bug", (bug) =>
          bug.setProps({
            schPinLabels: {
              1: "P1",
              2: "P2",
              3: "P3",
              4: "P4",
              5: "P5",
              6: "P6",
              7: "P7",
              8: "P8",
            },
            schPortArrangement: {
              leftSize: 4,
              rightSize: 4,
            },
            pcbRotation: "90deg",
            cadModel: {
              objUrl:
                "https://modelcdn.tscircuit.com/easyeda_models/download?pn=C128415&uuid=dc694c23844346e9981bdbac7bb76421",
            },
            footprint: "soic8_w7.2mm",
            pcbX: 3,
            pcbY: 3,
          })
        )
    )
    .build()

  await logSoup(soup)
  t.pass()
})
