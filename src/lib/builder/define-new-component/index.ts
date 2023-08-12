import { ProjectBuilder } from "../project-builder"
import {
  BaseComponentBuilder,
  ComponentBuilderClass,
} from "../component-builder/ComponentBuilder"
import { z } from "zod"
import { BuildContext } from "lib/types"

// TODO technically different stages have access to different things, so we
// might want multiple of these and some documentation on the steps of the build
export interface ConfigureStageContext<SourceProperties extends z.ZodRawShape> {
  source_properties: z.infer<z.ZodObject<SourceProperties>>
}

export const defineComponentConfig = <
  PascalName extends string,
  UnderscoreName extends string,
  SourceProperties extends z.ZodRawShape
>(
  opts: NewComponentOpts<PascalName, UnderscoreName, SourceProperties>
) => {
  return opts
}

export interface NewComponentOpts<
  PascalName extends string,
  UnderscoreName extends string,
  SourceProperties extends z.ZodRawShape
> {
  pascal_name: PascalName
  underscore_name: UnderscoreName
  source_properties: z.ZodObject<SourceProperties>
  configurePorts?: (
    builder: BaseComponentBuilder<
      NewComponentBuilder<PascalName, SourceProperties>
    >,
    ctx: ConfigureStageContext<SourceProperties> & BuildContext
  ) => unknown
  configureSchematicSymbols?: (
    builder: BaseComponentBuilder<
      NewComponentBuilder<PascalName, SourceProperties>
    >,
    ctx: ConfigureStageContext<SourceProperties> & BuildContext
  ) => unknown
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
      if (opts.configurePorts) {
        ;(this as any).configurePorts = (bc) => opts.configurePorts(this, bc)
      }
      if (opts.configureSchematicSymbols) {
        ;(this as any).configureSchematicSymbols = (bc) =>
          opts.configureSchematicSymbols(this, bc)
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
