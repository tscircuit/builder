import test from "ava"
import { findPossibleTraceLayerCombinations } from "lib/builder/trace-builder/pcb-routing/find-possible-trace-layer-combinations"

test("find possible trace layer combinations 1", (t) => {
  const candidates = findPossibleTraceLayerCombinations([
    {
      layers: ["top", "bottom"],
    },
    {
      via: true,
    },
    {
      layers: ["top", "bottom"],
    },
  ])
  t.is(
    candidates.map((c) => c.layer_path.join(",")).join("\n"),
    `

top,bottom,bottom
bottom,top,top


`.trim()
  )
})

test("find possible trace layer combinations 2", (t) => {
  const candidates = findPossibleTraceLayerCombinations([
    {
      layers: ["top", "bottom", "inner1"],
    },
    {
      via: true,
    },
    {
      layers: ["top", "bottom", "inner1"],
    },
  ])
  t.is(candidates.map((c) => c.layer_path.join(",")).length, 6)
})
