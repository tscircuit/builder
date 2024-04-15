import test from "ava"
import { SourceComponent, SourceComponentBase } from "lib/types"
import { convertBomRowsToCsv, convertSoupToBomRows } from "lib/bom-csv"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("convert soup to bom rows", async (t) => {
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
    .build()

  const source_component = soup.find(
    (elm) => elm.type === "source_component"
  )! as SourceComponentBase

  t.truthy(source_component.supplier_part_numbers!.jlcpcb)

  // @ts-ignore
  const bom_rows = await convertSoupToBomRows({ soup })

  t.is(bom_rows[0]!.supplier_part_number_columns!["JLCPCB Part#"], "C22775")

  const csv_string = convertBomRowsToCsv(bom_rows)

  t.truthy(csv_string.includes("C22775"))
})
