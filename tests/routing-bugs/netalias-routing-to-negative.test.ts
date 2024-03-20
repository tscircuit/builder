import test from "ava"
import { createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

/**
 * This takes a long time to run, let's figure out why.
 */

test("net_alias routing bug to negative", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
        .setSchematicProperties({
          port_arrangement: {
            left_side: {
              pins: [16, 15, 20, 17, 4, 27, 28, 19, 26, 25, 7, 18, 21],
              direction: "top-to-bottom",
            },
            right_side: {
              pins: [1, 5, 11, 3, 2, 9, 10, 6, 23, 22, 14, 13, 12],
              direction: "top-to-bottom",
            },
          },
          port_labels: {
            "1": "TXD",
            "5": "RXD",
            "11": "CTS",
            "3": "RTS",
            "2": "DTR",
            "9": "DSR",
            "10": "DCD",
            "6": "RI",
            "23": "TXLED",
            "22": "RXLED",
            "14": "PWRUN",
            "13": "TXDEN",
            "12": "SLEEP",
            "16": "USBDM",
            "15": "USBDP",
            "20": "VCC",
            "17": "3V3OUT",
            "4": "VCCIO",
            "27": "OSCI",
            "28": "OSCO",
            "19": "RESET",
            "26": "TEST",
            "25": "AGND",
            "7": "GND7",
            "18": "GND18",
            "21": "GND21",
          },
        })
        .setFootprint("ssop28Db")
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "1kohm",
          name: "R1",
        })
        .setSchematicCenter(3, 0)
        .setFootprint("0805")
        .setSchematicRotation("90deg")
    )
    .add("resistor", (rb) =>
      rb
        .setSourceProperties({
          resistance: "1kohm",
          name: "R2",
        })
        .setSchematicCenter(4.5, 0)
        .setFootprint("0805")
        .setSchematicRotation("90deg")
    )
    .add("diode", (db) =>
      db
        .setSourceProperties({ name: "LED1" })
        .setSchematicCenter(3, 2)
        .setFootprint("0805")
        .setSchematicRotation("90deg")
    )
    .add("diode", (db) =>
      db
        .setSourceProperties({ name: "LED2" })
        .setSchematicCenter(4.5, 2)
        .setFootprint("0805")
        .setSchematicRotation("90deg")
    )
    .add("net_alias", (bb) =>
      bb.setSourceProperties({ net: "5V" }).setSchematicCenter(3, -2)
    )
    .add("net_alias", (bb) =>
      bb.setSourceProperties({ net: "5V" }).setSchematicCenter(4.5, -2)
    )
    .add("trace", (bb) => bb.addConnections([".5V", ".R2 > port.left"]))
    .add("trace", (bb) => bb.addConnections([".5V", ".R1 > port.left"]))
    .add("trace", (bb) =>
      bb.addConnections([".R1 > port.right", ".LED1 > port.left"])
    )
    .add("trace", (bb) =>
      bb.addConnections([".R2 > port.right", ".LED2 > port.left"])
    )
    .add("trace", (bb) =>
      bb.addConnections([".LED1 > port.right", ".U1 > .TXLED"])
    )
    .add("trace", (bb) =>
      bb.addConnections([".LED2 > port.right", ".U1 > .RXLED"])
    )
    .add("net_alias", (bb) =>
      bb.setSourceProperties({ net: "5V" }).setSchematicCenter(-8, -8)
    )
    .build()

  await logLayout(`net alias routing bug to negative`, result)
  t.pass()
})
