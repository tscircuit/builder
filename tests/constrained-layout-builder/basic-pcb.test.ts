import type { PCBSMTPad } from "@tscircuit/soup"
import test from "ava"
import { createConstrainedLayoutBuilder, createProjectBuilder } from "../../src"
import { logLayout } from "../utils/log-layout"

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
    .addConstraint({
      type: "xdist",
      pcb: true,
      dist: 10,
      left: ".C1",
      right: ".C2",
    })

  /*
  BEFORE CONSTRAINT:
  ──────────────────┬─────────────────────┬──────┬───────────────────────────┬────────┬─────┬───┬───────┬────────┬
        type        │ source_component_id │ name │     pcb_component_id      │ shape  │  x  │ y │ width │ height │
  ──────────────────┼─────────────────────┼──────┼───────────────────────────┼────────┼─────┼───┼───────┼────────┼
  'source_component'│     'generic_0'     │ 'C1' │                           │        │     │   │       │        │
  'pcb_component'   │     'generic_0'     │      │ 'pcb_generic_component_0' │        │     │   │       │        │
    'pcb_smtpad'    │                     │      │ 'pcb_generic_component_0' │ 'rect' │  0  │ 0 │   1   │   1    │
    'pcb_smtpad'    │                     │      │ 'pcb_generic_component_0' │ 'rect' │ 1.5 │ 0 │   1   │   1    │
  'source_component'│     'generic_1'     │ 'C2' │                           │        │     │   │       │        │
  'pcb_component'   │     'generic_1'     │      │ 'pcb_generic_component_1' │        │     │   │       │        │
    'pcb_smtpad'    │                     │      │ 'pcb_generic_component_1' │ 'rect' │  0  │ 0 │   1   │   1    │
    'pcb_smtpad'    │                     │      │ 'pcb_generic_component_1' │ 'rect' │ 1.5 │ 0 │   1   │   1    │
  ──────────────────┴─────────────────────┴──────┴───────────────────────────┴────────┴─────┴───┴───────┴────────┴

  AFTER CONSTRAINT
───────────────────┬─────────────────────┬──────┬───────────────────────────┬────────┬───────┬───┬───────┬────────┬
       type        │ source_component_id │ name │     pcb_component_id      │ shape  │   x   │ y │ width │ height │
───────────────────┼─────────────────────┼──────┼───────────────────────────┼────────┼───────┼───┼───────┼────────┼
'source_component' │     'generic_0'     │ 'C1' │                           │        │       │   │       │        │
 'pcb_component'   │     'generic_0'     │      │ 'pcb_generic_component_0' │        │       │   │       │        │
   'pcb_smtpad'    │                     │      │ 'pcb_generic_component_0' │ 'rect' │ -6.25 │ 0 │   1   │   1    │
   'pcb_smtpad'    │                     │      │ 'pcb_generic_component_0' │ 'rect' │ -4.75 │ 0 │   1   │   1    │
'source_component' │     'generic_1'     │ 'C2' │                           │        │       │   │       │        │
 'pcb_component'   │     'generic_1'     │      │ 'pcb_generic_component_1' │        │       │   │       │        │
   'pcb_smtpad'    │                     │      │ 'pcb_generic_component_1' │ 'rect' │ 6.25  │ 0 │   1   │   1    │
   'pcb_smtpad'    │                     │      │ 'pcb_generic_component_1' │ 'rect' │ 7.75  │ 0 │   1   │   1    │
───────────────────┴─────────────────────┴──────┴───────────────────────────┴────────┴───────┴───┴───────┴────────┴
  */

  const elements = await cb.build(pb.createBuildContext())
  const pads: PCBSMTPad[] = elements.filter(
    (e) => e.type === "pcb_smtpad"
  ) as any

  const c1_pads = pads.filter(
    (p) => p.pcb_component_id === "pcb_generic_component_0"
  )
  const c2_pads = pads.filter(
    (p) => p.pcb_component_id === "pcb_generic_component_1"
  )

  const c1_max_x = Math.max(...c1_pads.map((p) => p.x))
  const c2_min_x = Math.min(...c2_pads.map((p) => p.x))

  // 10 + 0.5 * 2 because the constraint is 10 between, and each pad has 0.5 padding
  // due to a width of 1
  t.is(Math.abs(c1_max_x - c2_min_x), 10 + 0.5 * 2)

  await logLayout("basic pcb", elements)
})
