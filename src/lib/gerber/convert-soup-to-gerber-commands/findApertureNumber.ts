import {
  ApertureTemplateConfig,
  DefineAperatureTemplateCommand,
} from "../commands/define_aperture_template"
import { AnyGerberCommand } from "../any_gerber_command"

export const findApertureNumber = (
  glayer: AnyGerberCommand[],
  search_params:
    | {
        trace_width?: number
      }
    | ApertureTemplateConfig
): number => {
  let aperture
  if ("trace_width" in search_params) {
    const trace_width = search_params.trace_width
    aperture = glayer.find(
      (command): command is DefineAperatureTemplateCommand =>
        command.command_code === "ADD" &&
        command.standard_template_code === "C" &&
        command.diameter === trace_width
    )
  } else if ("standard_template_code" in search_params) {
    aperture = glayer.find(
      (command): command is DefineAperatureTemplateCommand =>
        command.command_code === "ADD" &&
        Object.keys(search_params).every(
          (param_name) => command[param_name] === search_params[param_name]
        )
    )
  }

  if (!aperture) {
    // TODO add FileFunction/layer name to this error to help narrow it
    throw new Error(
      `Aperture not found for search params ${JSON.stringify(search_params)}`
    )
  }
  return aperture.aperture_number
}
