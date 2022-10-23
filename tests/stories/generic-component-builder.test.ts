import test from "ava"
import {
  createBoxBuilder,
  createPlatedHoleBuilder,
  createPortBuilder,
  createProjectBuilder,
} from "lib/builder"

test("component build from scratch", async (t) => {
  const pb = await createProjectBuilder()

  const pins = ["rx", "tx", "d2"]

  pb.add("component", (cb) => {
    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i]
      const phb = createPlatedHoleBuilder(pb).setProps({
        // net: pin,
        x: `${i * 2.5}mm`,
        y: 0,
        outer_diameter: "2mm",
        hole_diameter: "1mm",
      })
      const portb = createPortBuilder(pb)
      // const bb = createBoxBuilder(pb)

      cb.appendChild(phb)
      cb.appendChild(portb)
    }
  })
  // convert this to builder form
  //   <component>
  //   {pins.map((label, i) => (
  //     <>
  //       <platedhole
  //         net={label}
  //         x={`${i * 2.5}mm`}
  //         y={0}
  //         outerDiameter="2mm"
  //         holeDiameter="1mm"
  //       />
  //       <port port net={label} x="-0.25in" y={`${i * 0.25}in`} />
  //       <schematicdrawing>
  //         <box w="0.5in" h="1in" x="0" y="0" />
  //         {pins.map((label, i) => (
  //           <line
  //             x1={"-0.25in"}
  //             y1={`${0.1 + 0.2 * i}in`}
  //             x2={"0in"}
  //             y2={`${0.1 + 0.2 * i}in`}
  //           />
  //         ))}
  //       </schematicdrawing>
  //     </>
  //   ))}
  //   </component>
  const
})
