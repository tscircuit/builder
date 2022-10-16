import { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export type ConstraintBuilderFields =
  | {
      type: "xdist"
      dist: number
      a: string
      b: string
    }
  | {
      type: "ydist"
      dist: number
      a: string
      b: string
    }

export interface ConstraintBuilder {
  builder_type: "constraint_builder"
  props: ConstraintBuilderFields
  setProps(props: Partial<ConstraintBuilderFields>): ConstraintBuilder
  build(): ConstraintBuilderFields
}

export const ConstraintBuilderClass = createSimpleDataBuilderClass<
  "constraint_builder",
  ConstraintBuilderFields
>("constraint_builder", {})

export const createConstraintBuilder = (
  project_builder: ProjectBuilder
): ConstraintBuilder => {
  return new ConstraintBuilderClass(project_builder)
}
