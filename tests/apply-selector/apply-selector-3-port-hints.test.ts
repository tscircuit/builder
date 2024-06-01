import * as Type from "lib/types"
import test from "ava"
import { createProjectBuilder, ProjectClass } from "lib/project"
import { applySelector } from "lib/apply-selector"

test("applySelector 3: port hints", async (t) => {
  const elements = await createProjectBuilder()
    .add("group", (gb) =>
      gb
        .addResistor((cb) =>
          cb.setSourceProperties({
            resistance: "10 ohm",
            name: "R1",
          })
        )
        .add("bug", (bb) =>
          bb.setProps({
            name: "U1",
            port_arrangement: {
              left_size: 1,
              right_size: 1,
            },
            port_labels: {
              1: "A",
              2: "B",
            },
          })
        )
    )
    .build()

  t.deepEqual(applySelector(elements, ".U1 > port.A"), [
    {
      type: "source_port",
      name: "A",
      source_port_id: "source_port_2",
      source_component_id: "simple_bug_0",
      pin_number: 1,
      port_hints: ["A", "1"],
    },
  ])
  // @ts-ignore
  t.is(applySelector(elements, ".U1 > port.1")[0]!.name, "A")
  // @ts-ignore
  t.is(applySelector(elements, ".U1 > .1")[0]!.name, "A")
  // @ts-ignore
  t.is(applySelector(elements, ".U1 > .A")[0]!.name, "A")
})
