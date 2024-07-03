import defaultAxios from "redaxios"
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
  if (globalThis?.process?.env?.CI) return
  if (globalThis?.process?.env?.FULL_TEST) return
  if (layout_server_healthy === false) return

  if (layout_server_healthy === null) {
    try {
      await axios.get("/api/health", {
        timeout: 1000,
      } as any)
      layout_server_healthy = true
    } catch (e) {
      layout_server_healthy = false
      return
    }
  }

  await axios
    .post("/api/soup_group/add_soup", {
      soup_group_name: `builder: ${layout_group_name}`,
      soup_name: "all",
      username: "tmp",
      content: {
        elements: objects.map((o: any) => ({
          ...o,
          source: findSource(o, objects),
        })),
      },
    })
    .catch((e) => {
      console.warn(`Couldn't log layout: ${layout_group_name}`)
    })
}
