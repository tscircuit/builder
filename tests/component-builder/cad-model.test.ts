import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("add cad_component when cadModel specified", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb
        .setProps({
          resistance: 100,
          name: "R2",
          rotation: "90deg",
          cadModel: {
            stlUrl: "https://example.com/resistor.stl",
          },
        })
        .setSchematicCenter(0, 2)
    )
    .build()

  t.is(su(soup).cad_component.list().length, 1)

  await logSoup(soup)
  t.pass()
})
