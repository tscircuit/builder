import * as Type from "lib/types"
import * as CB from "./component-builder"
import flatten from "lodash/flatten"
import { ProjectBuilder } from "./project-builder"
import {
  createTraceBuilder,
  convertToReadableTraceTree,
  TraceBuilder,
  TraceBuilderCallback,
} from "./trace-builder"

const addables = {
  generic_component: CB.createComponentBuilder,
  resistor: CB.createResistorBuilder,
  capacitor: CB.createCapacitorBuilder,
  diode: CB.createDiodeBuilder,
  power_source: CB.createPowerSourceBuilder,
  inductor: CB.createInductorBuilder,
  ground: CB.createGroundBuilder,
  trace: createTraceBuilder,
  group: createGroupBuilder,
}

export type GroupBuilderCallback = (gb: GroupBuilder) => unknown
export interface GroupBuilder {
  project_builder: ProjectBuilder
  builder_type: "group_builder"
  addables: typeof addables
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
  addDiode(capacitorBuilderCallback: CB.DiodeBuilderCallback): GroupBuilder
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
  add<T extends keyof typeof addables>(
    builder_type: T,
    callback: (builder: ReturnType<typeof addables[T]>) => unknown
  ): GroupBuilder
  build(): Promise<Type.AnyElement[]>
}

export function createGroupBuilder(
  project_builder?: ProjectBuilder
): GroupBuilder {
  const builder: GroupBuilder = {
    builder_type: "group_builder",
    project_builder,
    addables,
  } as any
  let internal

  builder.reset = () => {
    ;(builder as any)._internal = internal = {
      groups: [] as GroupBuilder[],
      components: [] as CB.BaseComponentBuilder<any>[],
      traces: [] as TraceBuilder[],
    }
    return builder
  }
  builder.reset()

  builder.add = (new_builder_type, callback) => {
    const new_builder = addables[new_builder_type](builder.project_builder)
    callback(new_builder as any) // not smart enough to infer generic
    return builder
  }

  builder.setName = (name: string) => {
    internal.name = name
    return builder
  }

  builder.appendChild = (child) => {
    if (child.builder_type === "group_builder") {
      internal.groups.push(child as any)
    } else if (child.builder_type === "trace_builder") {
      internal.traces.push(child as any)
    } else {
      internal.components.push(child as any)
    }
    return builder
  }

  builder.addGroup = (callbackOrObj) => {
    if (typeof callbackOrObj !== "function") {
      // TODO validate
      callbackOrObj.project_builder = builder.project_builder
      internal.groups.push(callbackOrObj)
      return builder
    }
    const callback = callbackOrObj

    const gb = createGroupBuilder()
    gb.project_builder = builder.project_builder
    internal.groups.push(gb)
    callback(gb)
    return builder
  }

  builder.addComponent = (callback) => {
    const cb = CB.createComponentBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addResistor = (callback) => {
    const cb = CB.createResistorBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addCapacitor = (callback) => {
    const cb = CB.createCapacitorBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addInductor = (callback) => {
    const cb = CB.createInductorBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addBug = (callback) => {
    const cb = CB.createBugBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addGround = (callback) => {
    const cb = CB.createGroundBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addPowerSource = (callback) => {
    const cb = CB.createPowerSourceBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }
  builder.addDiode = (callback) => {
    const cb = CB.createDiodeBuilder(builder.project_builder)
    internal.components.push(cb)
    callback(cb)
    return builder
  }

  builder.addTrace = (callback) => {
    if (typeof callback !== "function") {
      const portSelectors = callback as string[]
      callback = (rb) => {
        rb.addConnections(portSelectors)
      }
    }
    const rb = createTraceBuilder(builder.project_builder)
    internal.traces.push(rb)
    callback(rb)
    return builder
  }

  builder.build = async () => {
    const elements = []
    elements.push(
      ...flatten(await Promise.all(internal.groups.map((g) => g.build())))
    )
    elements.push(
      ...flatten(await Promise.all(internal.components.map((c) => c.build())))
    )
    elements.push(
      ...flatten(
        await Promise.all(internal.traces.map((c) => c.build(elements)))
      )
    )
    return elements
  }

  return builder
}
