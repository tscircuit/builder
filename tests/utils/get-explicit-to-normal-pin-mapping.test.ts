import test from "ava"
import {
  getExplicitToNormalPinMapping,
  getNormalToExplicitPinMapping,
} from "index"

test("get normal to explicit pin mapping", async (t) => {
  const port_arrangement = {
    left_side: {
      pins: [1, 8],
    },
    bottom_side: {
      pins: [3],
    },
    right_side: {
      pin_definition_direction: "top-to-bottom",
      pins: [2, 4],
    },
  }

  const normal_to_explicit_mapping = getNormalToExplicitPinMapping(
    port_arrangement as any
  )

  /**
   *   1     2
   *   8     4
   *      3
   */

  t.deepEqual(normal_to_explicit_mapping, [0, 1, 8, 3, 4, 2])

  const explicit_to_normal_mapping = getExplicitToNormalPinMapping(
    port_arrangement as any
  )

  t.deepEqual(explicit_to_normal_mapping, [
    0, // 0
    1, // 1
    5, // 2
    3, // 3
    4, // 4
    undefined, // 5
    undefined, // 6
    undefined, // 7
    2, // 8
  ])
})
