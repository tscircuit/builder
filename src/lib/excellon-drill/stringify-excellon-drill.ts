import {
  AnyExcellonDrillCommand,
  excellon_drill_command_map,
} from "./any-excellon-drill-command-map"

export const stringifyExcellonDrill = (
  commands: Array<AnyExcellonDrillCommand>
) => {
  return commands
    .map((c) => {
      const def = excellon_drill_command_map[c.command_code]
      return def.stringify(c as any)
    })
    .join("\n")
}
