import type { SourcePort, SourceTrace } from "@tscircuit/soup"
import type * as Type from "lib/types"

const elementArrayKeys = [
  "schematic_components",
  "schematic_groups",
  "schematic_traces",
  "schematic_ports",
  "pcb_groups",
  "pcb_components",
  "pcb_labels",
  "pcb_traces",
  "pcb_ports",
  "source_traces",
  "source_groups",
  "source_components",
  "source_ports",
]

/** Representation of a project with more utilities */
export class ProjectClass {
  project: Type.Project
  constructor(project: Type.Project) {
    this.project = project
  }
  getElements(): Type.AnyElement[] {
    return elementArrayKeys.flatMap((k) => this.project[k])
  }
  get(id: string): Type.AnyElement | null {
    return this.getElements().find((e) => e[`${e.type}_id`] === id) ?? null
  }
  getRelated<T extends Type.ElementType>(
    type: T,
    id: string
  ): Array<Type.ElementOfType<T>> {
    const mainElm = this.get(id)
    if (!mainElm) return []
    const joiningId = `${mainElm.type}_id`
    return this.getElements().filter(
      (e) => e.type === type && e[joiningId] === id
    ) as any
  }
  getSourceComponent(id: string): Type.SourceComponent | null {
    return (
      this.project.source_components.find(
        (c) => c.source_component_id === id
      ) ?? null
    )
  }
  getSourcePort(id: string): SourcePort | null {
    return (
      this.project.source_ports.find((c) => c.source_port_id === id) ?? null
    )
  }
  getSourceTrace(id: string): SourceTrace | null {
    return (
      this.project.source_traces.find((c) => c.source_trace_id === id) ?? null
    )
  }
}

export default ProjectClass
