import type {
  AnySoupElement,
  LayerRef,
  PCBPlatedHole,
  PCBSMTPad,
} from "lib/soup"
import { gerberBuilder } from "../gerber-builder"
import { GerberLayerName } from "./GerberLayerName"
import { AnyGerberCommand } from "../any_gerber_command"
import { getAllTraceWidths } from "./getAllTraceWidths"
import { ApertureTemplateConfig } from "../commands/define_aperture_template"
import stableStringify from "fast-json-stable-stringify"

export function defineAperturesForLayer({
  glayer,
  soup,
  glayer_name,
}: {
  glayer: AnyGerberCommand[]
  soup: AnySoupElement[]
  glayer_name: GerberLayerName
}) {
  const getNextApertureNumber = () => {
    const highest_aperture_number = glayer.reduce((acc, command) => {
      if (command.command_code === "ADD") {
        return Math.max(acc, command.aperture_number)
      }
      return acc
    }, 0)
    if (highest_aperture_number === 0) {
      return 10
    }
    return highest_aperture_number + 1
  }

  glayer.push(
    ...gerberBuilder()
      .add("comment", { comment: "aperture START LIST" })
      .build()
  )

  // Add all trace width apertures
  const traceWidths: Record<LayerRef, number[]> = getAllTraceWidths(soup)
  for (const width of traceWidths[glayer_name === "F_Cu" ? "top" : "bottom"]) {
    glayer.push(
      ...gerberBuilder()
        .add("define_aperture_template", {
          aperture_number: getNextApertureNumber(),
          standard_template_code: "C",
          diameter: width,
        })
        .build()
    )
  }

  // Add all pcb smtpad, plated hole etc. aperatures
  const apertureConfigs = getAllApertureTemplateConfigsForLayer(
    soup,
    glayer_name.startsWith("F_") ? "top" : "bottom"
  )

  for (const apertureConfig of apertureConfigs) {
    glayer.push(
      ...gerberBuilder()
        .add("define_aperture_template", {
          aperture_number: getNextApertureNumber(),
          ...apertureConfig,
        })
        .build()
    )
  }

  glayer.push(
    ...gerberBuilder()
      .add("delete_attribute", {})
      .add("comment", { comment: "aperture END LIST" })
      .build()
  )
}

export const getApertureConfigFromPcbSmtpad = (
  elm: PCBSMTPad
): ApertureTemplateConfig => {
  if (elm.shape === "rect") {
    return {
      standard_template_code: "R",
      x_size: elm.width,
      y_size: elm.height,
    }
  } else if (elm.shape === "circle") {
    return {
      standard_template_code: "C",
      diameter: elm.radius * 2,
    }
  } else {
    throw new Error(`Unsupported shape ${(elm as any).shape}`)
  }
}
export const getApertureConfigFromPcbPlatedHole = (
  elm: PCBPlatedHole
): ApertureTemplateConfig => {
  return {
    standard_template_code: "C",
    diameter: elm.outer_diameter,
    hole_diameter: elm.hole_diameter,
  }
}

function getAllApertureTemplateConfigsForLayer(
  soup: AnySoupElement[],
  layer: "top" | "bottom"
): ApertureTemplateConfig[] {
  const configs: ApertureTemplateConfig[] = []
  const configHashMap = new Set<string>()

  const addConfigIfNew = (config: ApertureTemplateConfig) => {
    const hash = stableStringify(config)
    if (!configHashMap.has(hash)) {
      configs.push(config)
      configHashMap.add(hash)
    }
  }

  for (const elm of soup) {
    if (elm.type === "pcb_smtpad") {
      if (elm.layer === layer) {
        addConfigIfNew(getApertureConfigFromPcbSmtpad(elm))
      }
    } else if (elm.type === "pcb_plated_hole") {
      if (elm.layers.includes(layer)) {
        addConfigIfNew(getApertureConfigFromPcbPlatedHole(elm))
      }
    }
  }

  return configs
}
