import { Dimension, SchematicPath } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export type SchematicPathBuilderFields = Partial<
  Omit<SchematicPath, "position"> & {
    position: { x: Dimension; y: Dimension }
  }
>

export interface SchematicPathBuilder {
  builder_type: "schematic_path_builder"
  props: SchematicPathBuilderFields
  setProps(props: Partial<SchematicPathBuilderFields>): SchematicPathBuilder
  build(): Omit<SchematicPathBuilderFields, "x" | "y"> & {
    x: Dimension
    y: Dimension
  }
}

export const SchematicPathBuilder = createSimpleDataBuilderClass(
  "schematic_path_builder",
  {
    type: "schematic_path",
    points: [],
  } as SchematicPathBuilder["props"],
  ["position"]
)

export const createSchematicPathBuilder = (
  project_builder: ProjectBuilder
): SchematicPathBuilder => {
  return new SchematicPathBuilder(project_builder) as any
}
