/**
 * A simple data builder is a builder that constructs a JSON object
 */

import type { BuildContext } from "lib/types"
import type { ProjectBuilder } from "./project-builder"

export interface SimpleDataBuilder<
  BuilderType extends string,
  Fields extends Object,
  UnitFields extends keyof Fields = never
> {
  builder_type: BuilderType
  project_builder: ProjectBuilder

  props: Fields
  setProps(props: Partial<Fields>): SimpleDataBuilder<BuilderType, Fields>

  build(bc: BuildContext): Omit<Fields, UnitFields> & Record<UnitFields, number>
}

export const createSimpleDataBuilderClass = <
  BuilderType extends string,
  Fields extends object,
  UnitField extends keyof Fields = keyof Fields,
  OutputFields extends object = Fields
>(
  builder_type: BuilderType,
  default_fields: Partial<Fields>,
  unit_fields: UnitField[] = [],
  propsPostprocessor?: (props: Fields, bc: BuildContext) => OutputFields
): {
  new (project_builder: ProjectBuilder): SimpleDataBuilder<
    BuilderType,
    Fields,
    UnitField
  >
} => {
  class SimpleDataBuilderClass
    implements SimpleDataBuilder<BuilderType, Fields>
  {
    builder_type: BuilderType = builder_type
    project_builder: ProjectBuilder

    props: Fields

    constructor(project_builder: ProjectBuilder) {
      this.project_builder = project_builder
      this.props = default_fields as any
    }

    setProps(props: Partial<Fields>) {
      this.props = { ...this.props, ...props }
      return this
    }

    build(bc: BuildContext) {
      const ret_obj: any = { ...this.props }
      for (const unit_field of unit_fields) {
        ret_obj[unit_field] = bc.convert(ret_obj[unit_field])
      }
      if (propsPostprocessor) {
        return propsPostprocessor(ret_obj, bc)
      }
      return ret_obj
    }
  }

  return SimpleDataBuilderClass as any
}
