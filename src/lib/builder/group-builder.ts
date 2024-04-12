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
import { createConstraintBuilder } from "./constrained-layout-builder"
import { createViaBuilder } from "./component-builder/ViaBuilder"

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
  } as const)

export type GroupBuilderAddables = ReturnType<typeof getGroupAddables>

export type GroupBuilderCallback = (gb: GroupBuilder) => unknown
export interface GroupBuilder {
  project_builder: ProjectBuilder
  builder_type: "group_builder" | "board_builder"
  addables: GroupBuilderAddables
  reset: () => GroupBuilder
  setName: (name: string) => GroupBuilder
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
  async build(bc): Promise<Type.AnyElement[]> {
    const elements: Type.AnyElement[] = []
    elements.push(
      ..._.flatten(await Promise.all(this.groups.map((g) => g.build(bc))))
    )
    elements.push(
      ..._.flatten(await Promise.all(this.components.map((c) => c.build(bc))))
    )
    elements.push(
      ..._.flatten(
        await Promise.all(this.traces.map((c) => c.build(elements, bc)))
      )
    )
    return elements
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
