import {
  GroupBuilderClass,
  createGroupBuilder,
  type GroupBuilder,
} from "./group-builder"
import * as Type from "lib/types"
import * as CB from "./component-builder"
import { TraceBuilder } from "./trace-builder"
import { createTraceBuilder } from "./trace-builder"
import { ProjectBuilder } from "./project-builder"
import { createTraceHintBuilder } from "./trace-hint-builder"
import { createNetBuilder } from "./net-builder/net-builder"
import type { BoardProps as OriginalBoardProps } from "@tscircuit/props"

interface ExtendedBoardProps extends OriginalBoardProps {
  board_thickness?: number | string
  center?: Type.Point
}

export interface LegacyBoardProps extends ExtendedBoardProps {
  center_x?: number | string
  center_y?: number | string
}

export const getBoardAddables = () => ({
  generic_component: CB.createComponentBuilder,
  component: CB.createComponentBuilder,
  resistor: CB.createResistorBuilder,
  net_alias: CB.createNetAliasBuilder,
  capacitor: CB.createCapacitorBuilder,
  diode: CB.createDiodeBuilder,
  led: CB.createLedBuilder,
  power_source: CB.createPowerSourceBuilder,
  inductor: CB.createInductorBuilder,
  ground: CB.createGroundBuilder,
  bug: CB.createBugBuilder,
  trace: createTraceBuilder,
  via: CB.createViaBuilder,
  group: createGroupBuilder,
  trace_hint: createTraceHintBuilder,
  net: createNetBuilder,
} as const)

export type BoardBuilderAddables = ReturnType<typeof getBoardAddables>

export interface BoardBuilder {
  project_builder: ProjectBuilder
  builder_type: "board_builder"
  addables: BoardBuilderAddables
  reset: () => BoardBuilder
  appendChild(
    child: CB.ComponentBuilder | GroupBuilder | TraceBuilder
  ): BoardBuilder
  add<T extends keyof BoardBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<BoardBuilderAddables[T]>) => unknown
  ): BoardBuilder
  setProps(props: LegacyBoardProps): BoardBuilder
  build(build_context: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class BoardBuilderClass
  extends GroupBuilderClass
  implements BoardBuilder {
  builder_type: "board_builder" = "board_builder"
  props: Partial<ExtendedBoardProps>
  declare addables: BoardBuilderAddables

  constructor(project_builder?: ProjectBuilder) {
    super(project_builder)
    this.props = {}
  }

  setProps(props: LegacyBoardProps): this {
    if (props.center_x !== undefined) props.pcbX = props.center_x
    if (props.center_y !== undefined) props.pcbY = props.center_y

    GroupBuilderClass.prototype.setProps.call(this, props)
    // have to manually set board props for now
    this.props = { ...this.props, ...props }
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.AnyElement[]> {
    const required_props = ["width", "height", "pcbX", "pcbY"]
    for (const prop of required_props) {
      if (this.props[prop] === undefined) {
        throw new Error(`<board /> "${prop}" is not set`)
      }
    }
    bc.board_thickness = this.props.board_thickness
      ? bc.convert(this.addUnitIfNeeded(this.props.board_thickness))
      : 1.2

    const convertProp = (prop: string | number | undefined): number => {
      if (prop === undefined) {
        throw new Error(`Property is undefined`)
      }
      return bc.convert(this.addUnitIfNeeded(prop)) as number
    }

    return [
      ...(await super.build(bc)),
      {
        type: "pcb_board",
        center: this.props.center
          ? bc.convert(this.props.center)
          : {
            x: convertProp(this.props.pcbX),
            y: convertProp(this.props.pcbY),
          },
        width: convertProp(this.props.width),
        height: convertProp(this.props.height),
      },
    ]
  }

  private addUnitIfNeeded(value: string | number): string {
    if (typeof value === 'number' || !isNaN(Number(value))) {
      return `${value}mm`
    }
    return value.toString()
  }
}

export function createBoardBuilder(
  project_builder?: ProjectBuilder
): BoardBuilder {
  const bb = new BoardBuilderClass(project_builder)
  return bb
}