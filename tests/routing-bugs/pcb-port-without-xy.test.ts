// REPRODUCTION IN REACT
// export const MyExample = () => {
//   return (
//     <group>
//       <component
//         name="B1"
//         footprint={
//           <footprint>
//             <platedhole
//               x={0}
//               y={-2}
//               port_hints={[`1`]}
//               hole_diameter={0.8}
//               outer_diameter={2}
//               inner_diameter={1.2}
//             />
//             <platedhole
//               x={0}
//               y={2}
//               port_hints={[`2`]}
//               hole_diameter={0.8}
//               outer_diameter={2}
//               inner_diameter={1.2}
//             />
//           </footprint>
//         }
//       >
//         <port x={0} y={-0.7} name="plus" pin_number={1} direction="up" />
//         <port x={0} y={0.7} name="minus" pin_number={2} direction="down" />
//       </component>
//       <resistor
//         name="R1"
//         pcb_x={4}
//         pcb_y={0}
//         resistance={"10k"}
//         footprint={"0805"}
//       />
//       <trace from=".B1 > .plus" to=".R1 > .left" />
//     </group>
//   )
// }

import test from "ava"
import { FootprintBuilder } from "index"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

const axial = (fb: FootprintBuilder) =>
  fb
    .add("platedhole", (pb) =>
      pb.setProps({
        x: "-0.5in",
        y: 0,
        hole_diameter: 0.8,
        outer_diameter: 1.2,
        port_hints: ["1"],
      })
    )
    .add("platedhole", (pb) =>
      pb.setProps({
        x: "0.5in",
        y: 0,
        hole_diameter: 0.8,
        outer_diameter: 1.2,
        port_hints: ["2"],
      })
    )

test("should not have a pcb trace error or port without x/y", async (t) => {
  const { pb, logSoup } = await getTestFixture(t)

  const soup = await pb
    .add("resistor", (rb) =>
      rb
        .setProps({
          name: "R1",
          resistance: "10k",
          center: [0, 0],
          footprint: "0805",
          pcb_x: 4,
          pcb_y: 0,
        })
        .modifyFootprint(axial)
    )
    .add("component", (cb) =>
      cb
        .setProps({ name: "B1" })
        .modifyFootprint(axial)
        .modifyPorts((pb) =>
          pb
            .add("port", (pb) =>
              pb.setProps({
                x: 0,
                y: -0.7,
                name: "plus",
                pin_number: 1,
                direction: "up",
              })
            )
            .add("port", (pb) =>
              pb.setProps({
                x: 0,
                y: 0.7,
                name: "minus",
                pin_number: 2,
                direction: "down",
              })
            )
        )
    )
    .add("trace", (tb) =>
      tb.setProps({
        from: ".R1 > .left",
        to: ".B1 > .minus",
      })
    )
    .build()
  const errors = soup.filter((e) => e.type.includes("error"))

  await logSoup(soup)
  t.is(errors.length, 0)
})
