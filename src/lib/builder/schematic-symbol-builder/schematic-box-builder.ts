import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface SchematicBoxBuilderFields {
  width: number
  height: number
  align: "center"
  x: number
  y: number
  name: string
}
export interface SchematicBoxBuilder {
  builder_type: "schematic_box_builder"
  props: SchematicBoxBuilderFields
  setProps(props: Partial<SchematicBoxBuilderFields>): SchematicBoxBuilder
  build(): SchematicBoxBuilderFields
}

export const SchematicBoxBuilderClass = createSimpleDataBuilderClass(
  "schematic_box_builder",
  {} as SchematicBoxBuilder["props"]
)

export const createSchematicBoxBuilder = (
  project_builder: ProjectBuilder
): SchematicBoxBuilder => {
  return new SchematicBoxBuilderClass(project_builder)
}
