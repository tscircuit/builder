import { su } from "@tscircuit/soup-util"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] silkscreen", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)
  const soup = await pb
    .add("component", (cb) =>
      cb.modifyFootprint((fb) =>
        fb.add("silkscreentext", (stb) =>
          stb.setProps({
            pcbX: 0,
            pcbY: 0,
            text: "Hello World",
          })
        )
      )
    )
    .build()

  const [silkscreen_text] = su(soup).pcb_silkscreen_text.list()
  t.is(silkscreen_text.text, "Hello World")
})
