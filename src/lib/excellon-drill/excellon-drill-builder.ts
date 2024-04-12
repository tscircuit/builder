import { z } from "zod"
import {
  AnyExcellonDrillCommand,
  excellon_drill_command_map,
} from "./any-excellon-drill-command-map"

class ExcellonDrillBuilder {
  commands: Array<AnyExcellonDrillCommand>

  constructor() {
    this.commands = []
  }

  add<T extends keyof typeof excellon_drill_command_map>(
    cmd: T,
    props: z.input<(typeof excellon_drill_command_map)[T]["schema"]>
  ): ExcellonDrillBuilder {
    this.commands.push({
      ...({
        command_code: excellon_drill_command_map[cmd].command_code,
      } as any),
      ...props,
    })
    return this
  }

  build(): Array<AnyExcellonDrillCommand> {
    return this.commands
  }
}

export const excellonDrill = () => new ExcellonDrillBuilder()
