import type { BuildContext, Dimension } from "lib/types"
import type { RequireAtLeastOne } from "type-fest"
import type { ProjectBuilder } from "../project-builder"
import { createSimpleDataBuilderClass } from "../simple-data-builder"

export type ConstraintContextFlag = RequireAtLeastOne<{
  schematic: boolean
  pcb: boolean
}>

export type ConstraintBuilderFields =
  | ({
      type: "xdist"
      dist: Dimension
      left: string
      right: string
    } & ConstraintContextFlag)
  | ({
      type: "ydist"
      dist: Dimension
      top: string
      bottom: string
    } & ConstraintContextFlag)

export interface ConstraintBuilder {
  builder_type: "constraint_builder"
  props: ConstraintBuilderFields
  setProps(props: Partial<ConstraintBuilderFields>): ConstraintBuilder
  build(
    bc: BuildContext
  ): Omit<ConstraintBuilderFields, "dist"> & { dist: number }
}

export const ConstraintBuilderClass = createSimpleDataBuilderClass<
  "constraint_builder",
  ConstraintBuilderFields,
  "dist"
>("constraint_builder", {}, ["dist"])

export const createConstraintBuilder = (
  project_builder: ProjectBuilder
): ConstraintBuilder => {
  return new ConstraintBuilderClass(project_builder) as any
}
