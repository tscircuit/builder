import test from "ava"
import {
  createConstrainedLayoutBuilder,
  createProjectBuilder,
  SchematicComponent,
} from "../../src"

test("basic pcb constraint builder test", async (t) => {
  const pb = createProjectBuilder()
  const cb = createConstrainedLayoutBuilder(pb)
    .add("component", (cb) => {
      cb.setName("C1")
      cb.footprint
        .addPad((smt) => smt.setShape("rect").setPosition(0, 0).setSize(1, 1))
        .addPad((smt) => smt.setShape("rect").setPosition(1.5, 0).setSize(1, 1))
    })
    .add("component", (cb) => {
      cb.setName("C2")
      cb.footprint
        .addPad((smt) => smt.setShape("rect").setPosition(0, 0).setSize(1, 1))
        .addPad((smt) => smt.setShape("rect").setPosition(1.5, 0).setSize(1, 1))
    })
  // .addConstraint({
  //   type: "xdist",
  //   pcb: true,
  //   dist: 2,
  //   left: ".C1",
  //   right: ".C2",
  // })

  const elements = await cb.build()
  console.log(elements)
  // const [e1, e2] = elements.filter(
  //   (e) => e.type === "schematic_component"
  // ) as SchematicComponent[]
  // t.is(e1.center.x + e1.size.width / 2 + 2, e2.center.x - e2.size.width / 2)
})
