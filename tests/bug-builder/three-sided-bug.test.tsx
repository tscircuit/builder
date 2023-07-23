import test from "ava"
import { createProjectBuilder } from "../../src"

test("three-sided bug", async (t) => {
  const result = await createProjectBuilder()
    .add("bug", (bb) =>
      bb
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
    .build()

  console.log(result)
})
