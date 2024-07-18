import type { Dimension } from "lib/types"
import type { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface SchematicBoxBuilderFields {
  type: "schematic_box"
  width: Dimension
  height: Dimension
  align: "center"
  x: Dimension
  y: Dimension
  cx: Dimension
  cy: Dimension
  center: [Dimension, Dimension]
  name: string
  drawing_type: "box"
}

export interface SchematicBoxBuilder {
  builder_type: "schematic_box_builder"
  props: SchematicBoxBuilderFields
  setProps(props: Partial<SchematicBoxBuilderFields>): SchematicBoxBuilder
  build(): Omit<
    SchematicBoxBuilderFields,
    "width" | "height" | "x" | "y" | "cx" | "cy" | "center"
  > & {
    width: number
    height: number
    x: number
    y: number
    cx: number
    cy: number
    center: [number, number]
  }
}

export const SchematicBoxBuilderClass = createSimpleDataBuilderClass(
  "schematic_box_builder",
  {
    drawing_type: "box",
    type: "schematic_box",
  } as SchematicBoxBuilder["props"],
  ["x", "y", "cx", "cy", "center", "width", "height"]
)

export const createSchematicBoxBuilder = (
  project_builder: ProjectBuilder
): SchematicBoxBuilder => {
  return new SchematicBoxBuilderClass(project_builder) as any
}

// Boxes can be used for both pcbs and schematics, react-fiber should probably
// determine which to use based on context...
export const createBoxBuilder = createSchematicBoxBuilder
