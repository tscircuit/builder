import { AnyGerberCommand } from "../any_gerber_command"
import { stringifyGerberCommand } from "./stringify-gerber-command"

export const stringifyGerberCommands = (
  commands: AnyGerberCommand[]
): string => {
  return commands
    .map((command) => {
      return stringifyGerberCommand(command)
    })
    .join("\n")
}
