import test from "ava"
import { getTestFixture } from "tests/fixtures/get-test-fixture"
import { su } from "@tscircuit/soup-util"

test("add cad_component on bottom layer", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("board", (bb) =>
      bb
        .setProps({
          width: 18,
          height: 26,
        })
        .add("bug", (bb) =>
          bb.setProps({
            name: "J1",
            footprint: "pinrow5",
            layer: "bottom",
            cadModel: {
              objUrl:
                "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=6331f645d89e4b919bdba0cb4f3544ce&pn=C124379",
            },
          })
        )
    )
    .build()

  const cadComponent = su(soup).cad_component.list()[0]
  t.is(cadComponent.layer, "bottom")
  t.deepEqual(cadComponent.rotation, { x: 0, y: 180, z: 0 })

  await logSoup(soup)
})
