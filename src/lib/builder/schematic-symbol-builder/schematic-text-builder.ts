import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface SchematicTextBuilderFields {
  align: "top-left"
  x: number
  y: number
  text: string
}
export interface SchematicTextBuilder {
  builder_type: "schematic_text_builder"
  props: SchematicTextBuilderFields
  setProps(props: Partial<SchematicTextBuilderFields>): SchematicTextBuilder
  build(): SchematicTextBuilderFields
}

export const SchematicTextBuilder = createSimpleDataBuilderClass(
  "schematic_text_builder",
  { align: "top-left" } as SchematicTextBuilder["props"]
)

export const createSchematicTextBuilder = (
  project_builder: ProjectBuilder
): SchematicTextBuilder => {
  return new SchematicTextBuilder(project_builder)
}
