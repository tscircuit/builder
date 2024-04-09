import { AnyGerberCommand, gerber_command_map } from "../any_gerber_command"

export const stringifyGerberCommand = (command: AnyGerberCommand): string => {
  const command_def = Object.values(gerber_command_map).find(
    (cmd) => cmd.command_code === command.command_code
  )

  if (!command_def) {
    throw new Error(
      `Command for command_code:"${command.command_code}" not found`
    )
  }

  if (!command_def.stringify) {
    throw new Error(
      `Command for command_code:"${command.command_code}" does not have a stringify method`
    )
  }

  return command_def.stringify(command as any)
}
