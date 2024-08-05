import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("Center with one prop", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)
  const soup = await pb
    .add("bug", (bb) =>
      bb.setProps({
        name: "U1",
        port_arrangement: {
          left_size: 1,
          right_size: 1,
        },
        port_labels: {
          1: "A",
          2: "B",
          3: "C",
        },
        schPortArrangement: {
          leftSide: {
            direction: "top-to-bottom",
            pins: [3],
          },
          bottomSide: {
            direction: "left-to-right",
            pins: [1],
          },
          rightSide: {
            direction: "left-to-right",
            pins: [2],
          },
        },
        schPinLabels: {
          1: "A",
          2: "B",
          3: "C",
        },
        cadModel: {
          rotationOffset: { x: 0, y: 0, z: 180 },
          objUrl:
            "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=d777607a152f4f3aac9bb0d0c14ed6fd&pn=C4355039",
        },
      })
    )
    .add("capacitor", (cb) =>
      cb
        .setProps({
          name: "C1",
          capacitance: "10 uF",
          center: { x: 8 }, // <-- this is the only prop that's different
        })
        .setSchematicRotation("90deg")
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".U1 > .B",
        to: ".C1 > .right",
      })
    )
    .add("bug", (bb) =>
      bb
        .setProps({
          name: "U2",
          port_arrangement: {
            left_size: 1,
            right_size: 1,
          },
          port_labels: {
            1: "A",
            2: "B",
          },
          schPortArrangement: {
            rightSide: {
              direction: "top-to-bottom",
              pins: [2, 1],
            },
          },
          cadModel: {
            rotationOffset: { x: 0, y: 0, z: 180 },
            objUrl:
              "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=d777607a152f4f3aac9bb0d0c14ed6fd&pn=C4355039",
          },
        })
        .labelPort(1, "PWRIN")
        .labelPort(2, "GND")
        .setSchematicCenter(-3, 0)
    )
    .add("trace", (tb) =>
      tb.setProps({ from: ".U2 > .GND", to: ".C1 > .left" })
    )
    .add("trace", (tb) => tb.setProps({ from: ".U2 > .PWRIN", to: ".U1 > .C" }))
    .build()

  await logSoup(soup)
  t.pass()
})
