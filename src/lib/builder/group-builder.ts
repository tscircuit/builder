import * as Type from "lib/types"
import * as CB from "./component-builder"
import _ from "lodash"
import { ProjectBuilder } from "./project-builder"
import {
  createTraceBuilder,
  convertToReadableTraceTree,
  TraceBuilder,
  TraceBuilderCallback,
} from "./trace-builder"
import { createTraceHintBuilder } from "./trace-hint-builder"
import { createConstraintBuilder } from "./constrained-layout-builder"
import { createViaBuilder } from "./component-builder/ViaBuilder"
import * as AutoSch from "@tscircuit/schematic-autolayout"
import { pairs } from "lib/utils/pairs"
import { applySelector } from "lib/apply-selector"
import { transformPCBElement, transformPCBElements } from "./transform-elements"
import { Matrix, compose, identity, translate } from "transformation-matrix"
import { LayoutBuilder } from "@tscircuit/layout"

export const getGroupAddables = () =>
  ({
    generic_component: CB.createComponentBuilder,
    component: CB.createComponentBuilder,
    resistor: CB.createResistorBuilder,
    net_alias: CB.createNetAliasBuilder,
    capacitor: CB.createCapacitorBuilder,
    diode: CB.createDiodeBuilder,
    power_source: CB.createPowerSourceBuilder,
    inductor: CB.createInductorBuilder,
    ground: CB.createGroundBuilder,
    bug: CB.createBugBuilder,
    trace: createTraceBuilder,
    via: createViaBuilder,
    group: createGroupBuilder,
    trace_hint: createTraceHintBuilder,
  } as const)

export type GroupBuilderAddables = ReturnType<typeof getGroupAddables>

export type GroupBuilderCallback = (gb: GroupBuilder) => unknown
export interface GroupBuilder {
  project_builder: ProjectBuilder
  builder_type: "group_builder" | "board_builder"
  addables: GroupBuilderAddables
  reset: () => GroupBuilder
  setName: (name: string) => GroupBuilder
  setProps: (props: any) => GroupBuilder
  appendChild(
    child: CB.ComponentBuilder | GroupBuilder | TraceBuilder
  ): GroupBuilder
  addGroup(
    groupBuilderCallback: GroupBuilderCallback | GroupBuilder
  ): GroupBuilder
  addComponent(
    componentBuilderCallback: CB.GenericComponentBuilderCallback
  ): GroupBuilder
  addResistor(resistorBuilderCallback: CB.ResistorBuilderCallback): GroupBuilder
  addCapacitor(
    capacitorBuilderCallback: CB.CapacitorBuilderCallback
  ): GroupBuilder
  addDiode(diodeBuilderCallback: CB.DiodeBuilderCallback): GroupBuilder
  addBug(bugBuilderCallback: CB.BugBuilderCallback): GroupBuilder
  addPowerSource(
    powerSourceBuilderCallback: CB.PowerSourceBuilderCallback
  ): GroupBuilder
  addInductor(
    powerSourceBuilderCallback: CB.InductorBuilderCallback
  ): GroupBuilder
  addGround(groundBuilderCallback: CB.GroundBuilderCallback): GroupBuilder
  addTrace: (
    traceBuiderCallback: TraceBuilderCallback | string[]
  ) => GroupBuilder
  add<T extends keyof GroupBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<GroupBuilderAddables[T]>) => unknown
  ): GroupBuilder
  build(build_context: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class GroupBuilderClass implements GroupBuilder {
  builder_type: "group_builder" | "board_builder" = "group_builder"
  groups: GroupBuilder[]
  components: CB.BaseComponentBuilder<any>[]
  traces: TraceBuilder[]
  project_builder: ProjectBuilder
  name: string
  addables: GroupBuilderAddables
  auto_layout?: { schematic: true }
  manual_layout?: Type.ManualLayout
  layout_builder?: LayoutBuilder

  constructor(project_builder?: ProjectBuilder) {
    this.project_builder = project_builder!
    this.addables = getGroupAddables()
    this.reset()
  }

  reset() {
    this.groups = []
    this.components = []
    this.traces = []
    return this
  }
  add(new_builder_type, callback) {
    if (!this.addables[new_builder_type]) {
      // console.log(
      //   Object.keys(this.addables),
      //   new_builder_type,
      //   this.addables[new_builder_type],
      //   new_builder_type in this.addables,
      //   CB
      // )
      throw new Error(
        `No addable in group builder for builder_type: "${new_builder_type}"`
      )
    }
    const new_builder = this.addables[new_builder_type](this.project_builder)
    callback(new_builder as any) // not smart enough to infer generic
    this.appendChild(new_builder)
    return this
  }
  setName(name) {
    this.name = name
    return this
  }
  setProps(props) {
    if (props.name) {
      this.setName(props.name)
    }
    if (props.auto_schematic_layout) {
      this.auto_layout = { schematic: true }
    }
    if (props.manual_layout) {
      this.manual_layout = props.manual_layout
    }
    if (props.layout) {
      this.layout_builder = props.layout
    }
    return this
  }
  appendChild(child) {
    if (
      [
        "schematic_symbol_builder",
        "schematic_box_builder",
        "schematic_line_builder",
        "schematic_text_builder",
      ].includes(child.builder_type)
    ) {
      throw new Error(
        `Schematic primitives can't be added to a group builder (try adding to a component)`
      )
    }

    // TODO just make this children?
    if (
      child.builder_type === "group_builder" ||
      child.builder_type === "board_builder"
    ) {
      this.groups.push(child as any)
    } else if (child.builder_type === "trace_builder") {
      this.traces.push(child as any)
    } else if (this.addables[child.builder_type.split("_builder")[0]]) {
      this.components.push(child as any)
    } else {
      throw new Error(
        `Unknown builder type for appendChild: "${child.builder_type}"`
      )
    }
    return this
  }
  addGroup(gb) {
    return this.add("group", gb)
  }
  addPowerSource(cb) {
    return this.add("power_source", cb)
  }
  addComponent(cb) {
    return this.add("component", cb)
  }
  addResistor(cb) {
    return this.add("resistor", cb)
  }
  addCapacitor(cb) {
    return this.add("capacitor", cb)
  }
  addBug(cb) {
    return this.add("bug", cb)
  }
  addDiode(cb) {
    return this.add("diode", cb)
  }
  addInductor(cb) {
    return this.add("diode", cb)
  }
  addGround(cb) {
    return this.add("ground", cb)
  }
  addTrace(tb) {
    if (typeof tb !== "function") {
      const portSelectors = tb as string[]
      tb = (rb) => {
        rb.addConnections(portSelectors)
      }
    }
    const builder = createTraceBuilder(this.project_builder)
    this.traces.push(builder)
    tb(builder)
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.AnyElement[]> {
    let elements: Type.AnyElement[] = []
    elements.push(
      ..._.flatten(await Promise.all(this.groups.map((g) => g.build(bc))))
    )
    elements.push(
      ..._.flatten(await Promise.all(this.components.map((c) => c.build(bc))))
    )

    if (this.auto_layout?.schematic) {
      this._autoLayoutSchematic(elements)
    }

    if (this.manual_layout && this.manual_layout.pcb_positions) {
      this._layoutPcbPositionsFromManualLayout(
        { elements, manual_layout: this.manual_layout },
        bc
      )
    }

    if (this.layout_builder) {
      this.layout_builder.applyToSoup(elements, bc)
    }

    elements.push(
      ..._.flatten(
        await Promise.all(this.traces.map((c) => c.build(elements, bc)))
      )
    )
    return elements
  }

  /**
   * @deprecated use the layout prop (@tscircuit/layout) instead
   */
  private _autoLayoutSchematic(elements: Type.AnySoupElement[]) {
    const scene = AutoSch.convertSoupToScene(elements)
    // We have to manually add the connections in a simple way to avoid
    // routing here
    for (const trc of this.traces) {
      const { source_ports_in_route } = trc.getSourcePortsInRoute(elements)
      for (const [spa, spb] of pairs(source_ports_in_route)) {
        scene.connections.push({
          from: spa.source_port_id,
          to: spb.source_port_id,
        })
      }
    }

    // console.log(JSON.stringify(scene))
    const laid_out_scene = AutoSch.ascendingCentralLrBug1(scene)
    // console.log(laid_out_scene)
    AutoSch.mutateSoupForScene(elements, laid_out_scene)
  }

  /**
   * @deprecated use the layout prop (@tscircuit/layout) instead
   */
  private _layoutPcbPositionsFromManualLayout(
    {
      elements,
      manual_layout,
    }: { elements: Type.AnySoupElement[]; manual_layout: Type.ManualLayout },
    bc: Type.BuildContext
  ) {
    for (const pcb_position of manual_layout.pcb_positions!) {
      const selector_matches = applySelector(elements, pcb_position.selector)
      if (selector_matches.length === 0) {
        elements.push({
          pcb_error_id: bc.getId("pcb_error"),
          type: "pcb_error",
          message: `No elements found for selector: "${pcb_position.selector}"`,
          error_type: "pcb_placement_error",
        })
        continue
      } else if (selector_matches.length > 1) {
        elements.push({
          pcb_error_id: bc.getId("pcb_error"),
          type: "pcb_error",
          message: `Multiple elements found for selector: "${pcb_position.selector}"`,
          error_type: "pcb_placement_error",
          // TODO add sources
        })
        continue
      }

      const source_component = selector_matches[0] as Type.SourceComponent
      const pcb_component = elements.find(
        (e) =>
          e.type === "pcb_component" &&
          e.source_component_id === source_component.source_component_id
      ) as Type.PCBComponent

      if (!pcb_component) {
        elements.push({
          pcb_error_id: bc.getId("pcb_error"),
          type: "pcb_error",
          message: `No pcb_component found for source component: "${source_component.source_component_id}"`,
          error_type: "pcb_placement_error",
        })
        continue
      }

      const relative_to = pcb_position.relative_to ?? "group_center"

      let mat: Matrix = identity()
      if (relative_to === "group_center") {
        const new_center = bc.convert(pcb_position.center)
        mat = compose(
          translate(-pcb_component.center.x, -pcb_component.center.y),
          translate(new_center.x, new_center.y)
        )
      } else {
        throw new Error(
          'relative_to is currently not supported for selectors (try using "group_center"'
        )
      }

      transformPCBElements(
        elements.filter(
          (e) =>
            "pcb_component_id" in e &&
            e.pcb_component_id === pcb_component.pcb_component_id
        ),
        mat
      )
    }
  }
}

/**
 * This uses an old construction pattern that's been tested.
 */
export function createGroupBuilder(
  project_builder?: ProjectBuilder
): GroupBuilder {
  const gb = new GroupBuilderClass(project_builder)
  return gb
}
