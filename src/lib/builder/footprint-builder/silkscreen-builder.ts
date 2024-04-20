import { defineNewComponent } from "../define-new-component"
import { z } from "zod"

export const { SilkscreenPathClass, createSilkscreenPath } = defineNewComponent(
  {
    underscore_name: "silkscreen_path",
    pascal_name: "SilkscreenPath",
    configureFootprint(builder, ctx) {},
    source_properties: z.object({}),
    schematic_properties: z.object({}),
    pcb_properties: z.object({}),
  }
)
