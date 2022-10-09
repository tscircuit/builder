import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface SchematicLineBuilderFields {
  x1: number
  y1: number
  x2: number
  y2: number
}
export interface SchematicLineBuilder {
  builder_type: "schematic_line_builder"
  props: SchematicLineBuilderFields
  setProps(props: Partial<SchematicLineBuilderFields>): SchematicLineBuilder
  build(): SchematicLineBuilderFields
}

export const SchematicLineBuilder = createSimpleDataBuilderClass(
  "schematic_line_builder",
  {} as SchematicLineBuilder["props"]
)

export const createSchematicLineBuilder = (
  project_builder: ProjectBuilder
): SchematicLineBuilder => {
  return new SchematicLineBuilder(project_builder)
}
