import { ProjectBuilder } from "../project-builder"
import {
  BaseComponentBuilder,
  ComponentBuilderClass,
} from "../component-builder/ComponentBuilder"
import { z } from "zod"
import { BuildContext } from "lib/types"

export type OptsDef<
  PascalName extends string,
  UnderscoreName extends string,
  TZodSrcProps extends z.ZodType<any>,
  TSrcProps = z.infer<TZodSrcProps>,
  Builder = BaseComponentBuilder<NewComponentBuilder<PascalName, TZodSrcProps>>
> = {
  pascal_name: PascalName
  underscore_name: UnderscoreName
  source_properties: TZodSrcProps

  configurePorts?: (
    builder: Builder,
    ctx: { source_properties: TSrcProps }
  ) => any
  configureSchematicSymbols?: (
    builder: Builder,
    ctx: { source_properties: TSrcProps }
  ) => unknown
}

export const defineComponentConfig = <
  TPN extends string,
  TUN extends string,
  TZodSrcProps extends z.ZodType<any>
>(
  opts: OptsDef<TPN, TUN, TZodSrcProps>
) => opts

export type NewComponentBuilder<
  PascalName extends string,
  TZodSrcProps extends z.ZodType<any>
> = BaseComponentBuilder<NewComponentBuilder<PascalName, TZodSrcProps>> & {
  builder_type: `${PascalName}Builder`
  setSourceProperties(
    properties: z.infer<TZodSrcProps>
  ): NewComponentBuilder<PascalName, TZodSrcProps>
}

export const defineNewComponent = <
  PascalName extends string,
  UnderscoreName extends string,
  TZodSrcProps extends z.ZodType<any>
  // TODO custom functions
>(
  opts: OptsDef<PascalName, UnderscoreName, TZodSrcProps>
): {
  [createFunc in `create${PascalName}Builder`]: (
    project_builder: ProjectBuilder
  ) => NewComponentBuilder<PascalName, TZodSrcProps>
} & {
  [classDef in `${PascalName}BuilderClass`]: NewComponentBuilder<
    PascalName,
    TZodSrcProps
  >
} => {
  class NewComponentBuilderClass
    extends ComponentBuilderClass
    implements NewComponentBuilder<PascalName, TZodSrcProps>
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
    ): NewComponentBuilder<PascalName, TZodSrcProps> => {
      return new NewComponentBuilderClass(project_builder)
    },
  } as any
}
