import { ProjectBuilder } from "../project-builder"
import {
  BaseComponentBuilder,
  ComponentBuilderClass,
} from "../component-builder/ComponentBuilder"
import { z } from "zod"
import { BuildContext } from "lib/types"
import { getZodSchemaDefaults } from "lib/utils/get-zod-schema-defaults"
import type { StandardFootprint, FootprintBuilder } from "../footprint-builder"

type DefaultSrcProps = { name: string }
type DefaultSchematicProps = {
  x: number | string
  center:
    | { x: number | string; y: number | string }
    | [number | string, number | string]
  rotation: number | string
}
type DefaultPcbProps = {
  pcb_x: string | number
  pcb_y: string | number
  pcb_rotation: string | number
  footprint: StandardFootprint | FootprintBuilder
}

export type OptsDef<
  PascalName extends string,
  UnderscoreName extends string,
  TZodSrcProps extends z.ZodType<any>,
  TZodSchProps extends z.ZodObject<any>,
  TZodPcbProps extends z.ZodObject<any>,
  TSrcProps = z.infer<TZodSrcProps>,
  Builder = BaseComponentBuilder<
    NewComponentBuilder<PascalName, TZodSrcProps, TZodSchProps, TZodPcbProps>
  >
> = {
  pascal_name: PascalName
  underscore_name: UnderscoreName
  source_properties: TZodSrcProps
  schematic_properties: TZodSchProps
  pcb_properties: TZodPcbProps

  configurePorts?: (
    builder: Builder,
    ctx: { source_properties: TSrcProps & Partial<DefaultSrcProps> }
  ) => any
  configureSchematicSymbols?: (
    builder: Builder,
    ctx: {
      source_properties: TSrcProps & Partial<DefaultSrcProps>
    }
  ) => unknown
  configureFootprint?: (
    builder: Builder,
    ctx: BuildContext & {
      props: TSrcProps &
        z.infer<TZodSchProps> &
        z.infer<TZodPcbProps> &
        Partial<DefaultPcbProps>
    }
  ) => unknown
}

export const defineComponentConfig = <
  TPN extends string,
  TUN extends string,
  TZodSrcProps extends z.ZodType<any>,
  TZodSchProps extends z.ZodObject<any>,
  TZodPcbProps extends z.ZodObject<any>
>(
  opts: OptsDef<TPN, TUN, TZodSrcProps, TZodSchProps, TZodPcbProps>
) => opts

export type NewComponentBuilder<
  PascalName extends string,
  TZodSrcProps extends z.ZodType<any>,
  TZodSchProps extends z.ZodObject<any>,
  TZodPcbProps extends z.ZodObject<any>
> = BaseComponentBuilder<
  NewComponentBuilder<PascalName, TZodSrcProps, TZodSchProps, TZodPcbProps>
> & {
  builder_type: `${PascalName}Builder`
  props?: z.input<TZodSrcProps> &
    z.input<TZodPcbProps> &
    z.input<TZodSchProps> &
    Partial<DefaultSrcProps> &
    Partial<DefaultSchematicProps> &
    Partial<DefaultPcbProps>
  setSourceProperties(
    properties: z.infer<TZodSrcProps> & Partial<DefaultSrcProps>
  ): NewComponentBuilder<PascalName, TZodSrcProps, TZodSchProps, TZodPcbProps>
}

export const defineNewComponent = <
  PascalName extends string,
  UnderscoreName extends string,
  TZodSrcProps extends z.ZodType<any>,
  TZodSchProps extends z.ZodObject<any>,
  TZodPcbProps extends z.ZodObject<any>
  // TODO custom functions
>(
  opts: OptsDef<
    PascalName,
    UnderscoreName,
    TZodSrcProps,
    TZodSchProps,
    TZodPcbProps
  >
): {
  [createFunc in `create${PascalName}Builder`]: (
    project_builder: ProjectBuilder
  ) => NewComponentBuilder<PascalName, TZodSrcProps, TZodSchProps, TZodPcbProps>
} & {
  [classDef in `${PascalName}BuilderClass`]: NewComponentBuilder<
    PascalName,
    TZodSrcProps,
    TZodSchProps,
    TZodPcbProps
  >
} => {
  class NewComponentBuilderClass
    extends ComponentBuilderClass
    implements
      NewComponentBuilder<PascalName, TZodSrcProps, TZodSchProps, TZodPcbProps>
  {
    constructor(project_builder: ProjectBuilder) {
      super(project_builder)
      this.source_properties = {
        ftype: opts.underscore_name,
        ...getZodSchemaDefaults(opts.source_properties as any),
      }
      if (opts.configurePorts) {
        ;(this as any).configurePorts = (bc) => opts.configurePorts?.(this, bc)
      }
      if (opts.configureSchematicSymbols) {
        ;(this as any).configureSchematicSymbols = (bc) =>
          opts.configureSchematicSymbols?.(this, bc)
      }
      if (opts.configureFootprint) {
        ;(this as any).configureFootprint = (bc) => {
          return opts.configureFootprint?.(this, {
            ...bc,
            props: {
              ...opts.source_properties.parse(bc.props),
              ...opts.schematic_properties.parse(bc.props),
              ...opts.pcb_properties.parse(bc.props),
            },
          })
        }
      }
      this.settable_source_properties = [
        ...this.settable_source_properties,
        ...Object.keys((opts.source_properties._def as any).shape()),
      ]
      this.settable_pcb_properties = [
        ...this.settable_pcb_properties,
        ...Object.keys((opts.pcb_properties._def as any).shape()),
      ]
      this.settable_schematic_properties = [
        ...this.settable_schematic_properties,
        ...Object.keys((opts.schematic_properties._def as any).shape()),
      ]
    }
  }

  const builder_class_name = `${opts.pascal_name}BuilderClass` as const
  const create_builder_name = `create${opts.pascal_name}Builder` as const

  return {
    [builder_class_name]: NewComponentBuilderClass,
    [create_builder_name]: (
      project_builder: ProjectBuilder
    ): NewComponentBuilder<
      PascalName,
      TZodSrcProps,
      TZodSchProps,
      TZodPcbProps
    > => {
      return new NewComponentBuilderClass(project_builder)
    },
  } as any
}
