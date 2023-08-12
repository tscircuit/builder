import { ProjectBuilder } from "../project-builder"
import {
  BaseComponentBuilder,
  ComponentBuilderClass,
} from "../component-builder/ComponentBuilder"
import { z } from "zod"

export interface NewComponentOpts<
  PascalName extends string,
  UnderscoreName extends string,
  SourceProperties extends z.ZodRawShape
> {
  pascal_name: PascalName
  underscore_name: UnderscoreName
  source_properties: z.ZodObject<SourceProperties>
}

export type NewComponentBuilder<
  PascalName extends string,
  SourceProperties extends z.ZodRawShape
> = BaseComponentBuilder<NewComponentBuilder<PascalName, SourceProperties>> & {
  builder_type: `${PascalName}Builder`
  setSourceProperties(
    properties: z.infer<z.ZodObject<SourceProperties>>
  ): NewComponentBuilder<PascalName, SourceProperties>
}

export const defineNewComponent = <
  PascalName extends string,
  UnderscoreName extends string,
  SourceProperties extends z.ZodRawShape
  // TODO custom functions
>(
  opts: NewComponentOpts<PascalName, UnderscoreName, SourceProperties>
): {
  [createFunc in `create${PascalName}Builder`]: (
    project_builder: ProjectBuilder
  ) => NewComponentBuilder<PascalName, SourceProperties>
} & {
  [classDef in `${PascalName}BuilderClass`]: NewComponentBuilder<
    PascalName,
    SourceProperties
  >
} => {
  class NewComponentBuilderClass
    extends ComponentBuilderClass
    implements NewComponentBuilder<PascalName, SourceProperties>
  {
    constructor(project_builder: ProjectBuilder) {
      super(project_builder)
      this.source_properties = {
        ...this.source_properties,
        ftype: opts.underscore_name,
      }
    }
  }

  const builder_class_name = `${opts.pascal_name}BuilderClass` as const
  const create_builder_name = `create${opts.pascal_name}Builder` as const

  return {
    [builder_class_name]: NewComponentBuilderClass,
    [create_builder_name]: (
      project_builder: ProjectBuilder
    ): NewComponentBuilder<PascalName, SourceProperties> => {
      return new NewComponentBuilderClass(project_builder)
    },
  } as any
}
