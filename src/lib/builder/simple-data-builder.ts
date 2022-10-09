/**
 * A simple data builder is a builder that constructs a JSON object
 */

import { ProjectBuilder } from "./project-builder"

export interface SimpleDataBuilder<
  BuilderType extends string,
  Fields extends Object
> {
  builder_type: BuilderType
  project_builder: ProjectBuilder

  props: Fields
  setProps(props: Partial<Fields>): SimpleDataBuilder<BuilderType, Fields>

  build(): Fields
}

export const createSimpleDataBuilderClass = <
  BuilderType extends string,
  Fields extends Object
>(
  builder_type: BuilderType,
  default_fields: Partial<Fields>
): {
  new (project_builder: ProjectBuilder): SimpleDataBuilder<BuilderType, Fields>
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

    build() {
      return this.props
    }
  }

  return SimpleDataBuilderClass
}
