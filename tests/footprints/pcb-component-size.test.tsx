import test from "ava"
import { getTestFixture } from "../fixtures/get-test-fixture"

test("pcb component width-height calculation from footprint", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb.setProps({
        footprint: "0805",
        resistance: "1k",
        name: "R1",
      })
    )
    .build()

  await logSoup(soup)

  const pcb_component = soup.find((e) => e.type === "pcb_component")!

  t.is(pcb_component.width, 2.6)
  t.is(pcb_component.height, 1.2)
})
