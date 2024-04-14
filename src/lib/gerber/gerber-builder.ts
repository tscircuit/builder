import { AnyGerberCommand } from "./any_gerber_command"
import { z } from "zod"
import { gerber_command_map } from "./any_gerber_command"

export const gerberBuilder = () => new GerberBuilder()

class GerberBuilder {
  commands: Array<AnyGerberCommand>

  constructor() {
    this.commands = []
  }

  $if(
    condition: boolean,
    fn: (gb: GerberBuilder) => GerberBuilder
  ): GerberBuilder {
    if (condition) {
      return fn(this)
    }
    return this
  }

  add<T extends keyof typeof gerber_command_map>(
    cmd: T,
    props: z.input<(typeof gerber_command_map)[T]["schema"]>
  ): GerberBuilder {
    this.commands.push({
      ...({ command_code: gerber_command_map[cmd].command_code } as any),
      ...props,
    })
    return this
  }

  build(): Array<AnyGerberCommand> {
    return this.commands
  }
}

// Type test:
// gerber()
//   .add("add_attribute_on_aperture", {
//     attribute_name: "foo",
//     attribute_value: "bar",
//   })
//   .add("end_of_file", {})
//   .build()
