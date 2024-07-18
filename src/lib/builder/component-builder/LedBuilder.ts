import { z } from "zod"
import { defineNewComponent } from "../define-new-component"

export const { LedBuilderClass, createLedBuilder } = defineNewComponent({
  pascal_name: "Led",
  underscore_name: "led",
  source_properties: z.object({
    ftype: z.literal("simple_led").default("simple_led"),
  }),
  schematic_properties: z.object({}),
  pcb_properties: z.object({}),
  configurePorts(builder, ctx) {
    builder.ports
      .add("port", (pb) =>
        pb
          .setName("left")
          .setSchematicPosition({ x: -0.5, y: 0 })
          .setPinNumber(1)
          .setSchematicPinNumberVisible(false)
          .setPortHints(["anode", "positive"])
          .setSchematicDirection("left")
      )
      .add("port", (pb) =>
        pb
          .setName("right")
          .setSchematicPosition({ x: 0.5, y: 0 })
          .setPinNumber(2)
          .setPortHints(["cathode", "negative"])
          .setSchematicPinNumberVisible(false)
          .setSchematicDirection("right")
      )
  },
  configureSchematicSymbols(builder, ctx) {
    builder.schematic_symbol.add("schematic_text", (stb) =>
      stb.setProps({
        text: ctx.source_properties.name,
        anchor: "center",
        position: {
          x: 0,
          y: "-0.25mm",
        },
      })
    )
  },
})

export type LedBuilder = ReturnType<typeof createLedBuilder>
