import { PCBComponent, PCBPort, PCBTrace, SchematicComponent, SchematicPort, SchematicText, SchematicTrace, SourcePort, SourceTrace } from "@tscircuit/soup"
import type * as Type from "lib/types/index"

export const createProjectFromElements = (
  objects: Type.AnyElement[]
): Type.Project => {
  const project: Type.Project = {
    type: "project",
    // schematic_config:
    //   (objects.find(
    //     (o) => o.type === "schematic_config"
    //   ) as SchematicConfig) || defaultSchematicConfig,
    schematic_components: objects.filter(
      (o) => o.type === "schematic_component"
    ) as SchematicComponent[],
    // schematic_groups: objects.filter(
    //   (o) => o.type === "schematic_group"
    // ) as SchematicGroup[],
    schematic_traces: objects.filter(
      (o) => o.type === "schematic_trace"
    ) as SchematicTrace[],
    schematic_ports: objects.filter(
      (o) => o.type === "schematic_port"
    ) as SchematicPort[],
    schematic_texts: objects.filter(
      (o) => o.type === "schematic_text"
    ) as SchematicText[],
    // pcb_config:
    //   (objects.find((o) => o.type === "pcb_config") as PCBConfig) ||
    //   defaultPCBConfig,
    // pcb_groups: objects.filter(
    //   (o) => o.type === "pcb_group"
    // ) as PCBGroup[],
    pcb_components: objects.filter(
      (o) => o.type === "pcb_component"
    ) as PCBComponent[],
    pcb_traces: objects.filter(
      (o) => o.type === "pcb_trace"
    ) as PCBTrace[],
    pcb_ports: objects.filter((o) => o.type === "pcb_port") as PCBPort[],
    // source_config:
    //   (objects.find((o) => o.type === "source_config") as SourceConfig) ||
    //   defaultSourceConfig,
    source_traces: objects.filter(
      (o) => o.type === "source_trace"
    ) as SourceTrace[],
    // source_groups: objects.filter(
    //   (o) => o.type === "source_group"
    // ) as SourceGroup[],
    source_components: objects.filter(
      (o) => o.type === "source_component"
    ) as Type.SourceComponent[],
    source_ports: objects.filter(
      (o) => o.type === "source_port"
    ) as SourcePort[],
  }
  return project
}
