import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export interface HoleFields {
  hole_diameter: number
  x: number
  y: number
  name: string
}
export interface HoleBuilder {
  builder_type: "hole_builder"
  props: HoleFields
  setProps(props: Partial<HoleFields>): HoleBuilder
  build(): HoleFields
}

export const HoleBuilderClass = createSimpleDataBuilderClass(
  "hole_builder",
  {} as HoleBuilder["props"]
)

export const createHoleBuilder = (
  project_builder: ProjectBuilder
): HoleBuilder => {
  return new HoleBuilderClass(project_builder)
}
