import { DefineAperatureTemplateCommand } from "../commands/define_aperture_template"
import { AnyGerberCommand } from "../any_gerber_command"

export const findApertureNumber = (
  glayer: AnyGerberCommand[],
  search_params:
    | {
        trace_width?: number
      }
    | {
        pad_width?: number
        pad_height?: number
      }
): number => {
  let aperture
  if ("trace_width" in search_params) {
    const trace_width = search_params.trace_width
    aperture = glayer.find(
      (command): command is DefineAperatureTemplateCommand =>
        command.command_code === "ADD" && command.hole_diameter === trace_width
    )
  } else if ("pad_width" in search_params && "pad_height" in search_params) {
    aperture = glayer.find(
      (command): command is DefineAperatureTemplateCommand =>
        command.command_code === "ADD" &&
        command.standard_template_code === "O" &&
        command.x_size === search_params.pad_width &&
        command.y_size === search_params.pad_height
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
