import su from "@tscircuit/soup-util"
import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("[smoke] fabrication", async (t) => {
  const { logSoup, pb } = await getTestFixture(t)
  const soup = await pb
    .add("component", (cb) =>
      cb.modifyFootprint((fb) =>
        fb
          .add("fabricationnotetext", (stb) =>
            stb.setProps({
              pcbX: 0,
              pcbY: 0,
              text: "Hello World",
            })
          )
          .add("fabricationnotepath", (stb) => {
            stb.setProps({
              route: [
                {
                  x: 0,
                  y: 0,
                },
                {
                  x: 2,
                  y: 2,
                },
              ],
            })
          })
      )
    )
    .build()

  const [silkscreen_text] = su(soup).pcb_silkscreen_text.list()
  t.is(silkscreen_text.text, "Hello World")
})
