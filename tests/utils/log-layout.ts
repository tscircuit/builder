import defaultAxios from "axios"
import { AnyElement } from "lib/types"

const DEBUG_SRV = `https://debug.tscircuit.com`

const axios = defaultAxios.create({
  baseURL: DEBUG_SRV,
})

function findSource(elm: AnyElement, sources: Array<AnyElement>) {
  if ("source_component_id" in elm) {
    return sources.find(
      (s) =>
        "source_component_id" in s &&
        s.source_component_id === elm.source_component_id &&
        s.type === "source_component"
    )
  }
  if ("source_port_id" in elm) {
    return sources.find(
      (s) =>
        "source_port_id" in s &&
        s.source_port_id === elm.source_port_id &&
        s.type === "source_port"
    )
  }
  return null
}

let layout_server_healthy: boolean | null = null
export const logLayout = async (
  layout_group_name: string,
  objects: Array<AnyElement>
) => {
  if (layout_server_healthy === false) return

  if (layout_server_healthy === null) {
    try {
      await axios.get("/api/health", {
        timeout: 1000,
      })
      layout_server_healthy = true
    } catch (e) {
      layout_server_healthy = false
      return
    }
  }

  for (const layout_name of ["schematic", "pcb"]) {
    await axios.post("/api/soup_group/add_soup", {
      soup_group_name: `builder: ${layout_group_name}`,
      soup_name: layout_name,
      username: "tmp",
      content: {
        elements: objects
          .filter(
            (o) => o.type?.includes(layout_name) || o.type.startsWith("source_")
          )
          .map((o: any) => ({
            ...o,
            source: findSource(o, objects),
          })),
      },
    })
  }
}
