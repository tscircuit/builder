import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface PlatedHoleFields {
  outer_diameter: number
  hole_diameter: number
  x: number
  y: number
  name: string
}
export interface PlatedHoleBuilder {
  builder_type: "plated_hole_builder"
  props: PlatedHoleFields
  setProps(props: Partial<PlatedHoleFields>): PlatedHoleBuilder
  build(): PlatedHoleFields
}

export const PlatedHoleBuilderClass = createSimpleDataBuilderClass(
  "plated_hole_builder",
  {} as PlatedHoleBuilder["props"]
)

export const createPlatedHoleBuilder = (
  project_builder: ProjectBuilder
): PlatedHoleBuilder => {
  return new PlatedHoleBuilderClass(project_builder)
}
