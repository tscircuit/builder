import { layer_ref, length } from "@tscircuit/soup"
import { z } from "zod"
import { defineNewComponent } from "../define-new-component"

export const { ViaBuilderClass, createViaBuilder } = defineNewComponent({
  pascal_name: "Via",
  underscore_name: "via",
  source_properties: z.object({
    from_layer: layer_ref.optional(),
    to_layer: layer_ref.optional(),
    layers: z.array(layer_ref).optional(),
  }),
  pcb_properties: z.object({
    pcb_x: length.default("0mm"),
    pcb_y: length.default("0mm"),
    outer_diameter: length.default("0.6mm"),
    hole_diameter: length.default("0.25mm"),
  }),
  schematic_properties: z.object({}),
  configurePorts(builder, ctx) {
    builder.ports
      .add("port", (pb) =>
        pb
          .setName("top")
          .setSchematicPosition({ x: 0, y: 0.5 })
          .setPinNumber(1)
          .setSchematicPinNumberVisible(false)
          .setSchematicDirection("up")
      )
      .add("port", (pb) =>
        pb
          .setName("bottom")
          .setSchematicPosition({ x: 0, y: -0.5 })
          .setPinNumber(2)
          .setSchematicPinNumberVisible(false)
          .setSchematicDirection("down")
      )
  },
  configureSchematicSymbols(builder, ctx) {
    builder.schematic_symbol.add("schematic_line", (sb) =>
      sb.setProps({
        x1: 0,
        y1: 0.5,
        x2: 0,
        y2: -0.5,
      })
    )

    // The via symbol looks like this, where the pipe is the central schematic
    // line defined above: "]|["
    // We add a path for each square bracket composed of 4 points
    builder.schematic_symbol.add("schematic_path", (spb) =>
      spb.setProps({
        is_filled: false,
        points: [
          {
            x: -0.3,
            y: 0.3,
          },
          {
            x: -0.1,
            y: 0.3,
          },
          {
            x: -0.1,
            y: -0.3,
          },
          {
            x: -0.3,
            y: -0.3,
          },
        ],
      })
    )
    builder.schematic_symbol.add("schematic_path", (spb) =>
      spb.setProps({
        is_filled: false,
        points: [
          {
            x: 0.3,
            y: 0.3,
          },
          {
            x: 0.1,
            y: 0.3,
          },
          {
            x: 0.1,
            y: -0.3,
          },
          {
            x: 0.3,
            y: -0.3,
          },
        ],
      })
    )

    builder.schematic_symbol.add("schematic_text", (stb) =>
      stb.setProps({
        text: ctx.source_properties.name,
        anchor: "center",
        position: {
          x: "0.25mm",
          y: 0,
        },
      })
    )
  },
  configureFootprint(builder, { props }) {
    builder.footprint
      .add("smtpad", (spb) =>
        spb.setProps({
          x: 0,
          layer: props.from_layer as any,
          y: 0,
          shape: "circle",
          radius: props.outer_diameter / 2,
          port_hints: ["top"],
        })
      )
      .add("smtpad", (spb) =>
        spb.setProps({
          layer: props.to_layer as any,
          shape: "circle",
          x: 0,
          y: 0,
          radius: props.outer_diameter / 2,
          port_hints: ["bottom"],
        })
      )
      .add("pcb_via", (pvb) =>
        pvb.setProps({
          hole_diameter: props.hole_diameter,
          outer_diameter: props.outer_diameter,
          x: 0,
          y: 0,
          layers: props.layers! ?? [props.from_layer, props.to_layer],
        })
      )
  },
})

export type ViaBuilder = ReturnType<typeof createViaBuilder>

// Added for legacy compat
// export type ViaBuilderCallback = (rb: ViaBuilder) => unknown
