import type * as Soup from "@tscircuit/soup"
import type { Dimension } from "lib/types"
import type { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export type SchematicPathBuilderFields = Partial<
  Omit<Soup.SchematicPath, "position" | "points"> & {
    position: { x: Dimension; y: Dimension }
    points: { x: Dimension; y: Dimension }[]
  }
>

export interface SchematicPathBuilder {
  builder_type: "schematic_path_builder"
  props: SchematicPathBuilderFields
  setProps(props: Partial<SchematicPathBuilderFields>): SchematicPathBuilder
  build(): Soup.SchematicPath[]
}

export const SchematicPathBuilder = createSimpleDataBuilderClass(
  "schematic_path_builder",
  {
    type: "schematic_path",
    points: [],
  } as SchematicPathBuilder["props"],
  ["position"],
  (props, bc) => ({
    ...props,
    points: props.points.map((point) => ({
      x: bc.convert(point.x),
      y: bc.convert(point.y),
    })),
  })
)

export const createSchematicPathBuilder = (
  project_builder: ProjectBuilder
): SchematicPathBuilder => {
  return new SchematicPathBuilder(project_builder) as any
}
