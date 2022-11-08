import test from "ava"
import { createProjectBuilder } from "lib/builder"
import { logLayout } from "../utils/log-layout"

test("render an led circuit project", async (t) => {
  const projectTSBO = await createProjectBuilder()
    .add("group", (gb) =>
      gb
        .add("resistor", (rb) =>
          rb
            .setSourceProperties({
              resistance: "10 ohm",
              name: "R1",
            })
            .setSchematicCenter(2, 1)
        )
        .add("capacitor", (cb) =>
          cb
            .setSourceProperties({
              name: "C1",
              capacitance: "10 uF",
            })
            .setSchematicCenter(4, 2)
            .setSchematicRotation("90deg")
        )
        .add("resistor", (cb) =>
          cb
            .setSourceProperties({
              resistance: "10 ohm",
              name: "R2",
            })
            .setSchematicCenter(6, 1)
            .setSchematicRotation("90deg")
        )
        .add("trace", (tb) => {
          tb.addConnections([
            ".R1 > port.right",
            ".C1 > port.left",
            ".R2 > port.left",
          ])
        })
        .add("power_source", (cb) =>
          cb
            .setSourceProperties({
              voltage: "5V",
              name: "main_power",
            })
            .setSchematicCenter(1, 2)
        )
        .add("trace", (tb) => {
          tb.addConnections(["power > port.positive", ".R1 > port.left"])
        })
        .add("trace", (tb) => {
          tb.addConnections([
            "power > port.negative",
            ".C1 > port.right",
            ".R2 > port.right",
          ])
        })
        .add("bug", (cb) =>
          cb
            .setSourceProperties({ name: "B1" })
            .setSchematicProperties({
              port_arrangement: {
                left_size: 3,
                right_size: 3,
              },
            })
            .labelPort(1, "PWR")
            .labelPort(2, "NC")
            .labelPort(3, "RG")
            .labelPort(4, "D0")
            .labelPort(5, "D1")
            .labelPort(6, "GND")
            .setSchematicCenter(8, 3)
        )
        .add("trace", (tb) => {
          tb.addConnections([".B1 > port.PWR", ".R2 > port.left"])
        })
        .add("ground", (cb) =>
          cb
            .setSourceProperties({
              name: "GND",
            })
            .setSchematicCenter(11, 3)
        )
        .add("trace", (tb) => {
          tb.addConnections([".B1 > port.GND", ".gnd"])
        })
        .add("diode", (db) =>
          db
            .setSourceProperties({ name: "D1" })
            .setSchematicCenter(6, 3.5)
            .setSchematicRotation("180deg")
        )
        .add("trace", (tb) => tb.addConnections([".D1 > .left", ".B1 > .RG"]))
        .add("trace", (tb) =>
          tb.addConnections([".D1 > .right", ".C1 > .right"])
        )
    )
    .build()

  await logLayout("led-circuit", projectTSBO)
  t.snapshot(projectTSBO, "led circuit")
})
