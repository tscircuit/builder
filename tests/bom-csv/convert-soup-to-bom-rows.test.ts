import test from "ava"
import { convertSoupToBomRows } from "lib/bom-csv"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("convert soup to bom rows", async (t) => {
  const { pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        name: "R1",
        part_numbers: ["123456"],
      })
    )
    .build()

  // @ts-ignore
  console.log(await convertSoupToBomRows({ soup }))
  t.pass()
})
