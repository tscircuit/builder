import test from "ava"
import { convertBomRowsToCsv, convertSoupToBomRows } from "lib/bom-csv"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("convert soup to bom rows (variety)", async (t) => {
  const { pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        name: "R1",
        footprint: "0805",
        resistance: "10k",
        supplier_part_numbers: {
          jlcpcb: ["C22775"],
        },
      })
    )
    .add("capacitor", (cb) =>
      cb.setProps({
        name: "C1",
        footprint: "0805",
        capacitance: "10u",
        supplier_part_numbers: {
          jlcpcb: ["C22776"],
        },
      })
    )
    .add("bug", (bb) =>
      bb
        .setProps({
          name: "B1",
          supplier_part_numbers: {
            jlcpcb: ["C596355"],
          },
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
    )
    .build()

  // @ts-ignore
  const bom_rows = await convertSoupToBomRows({ soup })
  const csv_string = convertBomRowsToCsv(bom_rows)

  t.truthy(csv_string.includes("C22775"), "has resistor part number")
  t.truthy(csv_string.includes("C22776"), "has capacitor part number")
  t.truthy(csv_string.includes("C596355"), "has bug part number")
})
