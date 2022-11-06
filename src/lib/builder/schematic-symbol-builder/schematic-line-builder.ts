import { BuildContext, Dimension } from "lib/types"
import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface SchematicLineBuilderFields {
  type: "schematic_line"
  x1: Dimension
  y1: Dimension
  x2: Dimension
  y2: Dimension
  drawing_type: "line"
}

export interface SchematicLineBuilder {
  builder_type: "schematic_line_builder"
  props: SchematicLineBuilderFields
  setProps(props: Partial<SchematicLineBuilderFields>): SchematicLineBuilder
  build(bc: BuildContext): Omit<
    SchematicLineBuilderFields,
    "x1" | "y1" | "x2" | "y2"
  > & {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

export const SchematicLineBuilder = createSimpleDataBuilderClass(
  "schematic_line_builder",
  {
    drawing_type: "line",
    type: "schematic_line",
  } as SchematicLineBuilder["props"],
  ["x1", "y1", "x2", "y2"]
)

export const createSchematicLineBuilder = (
  project_builder: ProjectBuilder
): SchematicLineBuilder => {
  return new SchematicLineBuilder(project_builder) as any
}
