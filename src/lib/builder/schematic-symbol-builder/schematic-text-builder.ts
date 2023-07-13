import { Dimension } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface SchematicTextBuilderFields {
  align: "top-left"
  x: Dimension
  y: Dimension
  text: string
  drawing_type: "text"
}
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
  { align: "top-left", drawing_type: "text" } as SchematicTextBuilder["props"]
)

export const createSchematicTextBuilder = (
  project_builder: ProjectBuilder
): SchematicTextBuilder => {
  return new SchematicTextBuilder(project_builder) as any
}
