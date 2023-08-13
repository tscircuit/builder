import { Dimension, SchematicText } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export type SchematicTextBuilderFields = Partial<SchematicText>

export interface SchematicTextBuilder {
  builder_type: "schematic_text_builder"
  props: SchematicTextBuilderFields
  setProps(props: Partial<SchematicTextBuilderFields>): SchematicTextBuilder
  build(): Omit<SchematicTextBuilderFields, "x" | "y"> & {
    x: number
    y: number
  }
}

export const SchematicTextBuilder = createSimpleDataBuilderClass(
  "schematic_text_builder",
  {
    anchor: "center",
    type: "schematic_text",
    position: { x: 0, y: 0 },
  } as SchematicTextBuilder["props"],
)

export const createSchematicTextBuilder = (
  project_builder: ProjectBuilder,
): SchematicTextBuilder => {
  return new SchematicTextBuilder(project_builder) as any
}
