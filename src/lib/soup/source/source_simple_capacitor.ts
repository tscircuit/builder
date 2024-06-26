import { z } from "zod"
import { source_component_base } from "lib/soup/source/base/source_component_base"
import { capacitance } from "lib/soup/units"

export const source_simple_capacitor = source_component_base.extend({
  ftype: z.literal("simple_capacitor"),
  capacitance,
})

export type SourceSimpleCapacitor = z.infer<typeof source_simple_capacitor>
export type SourceSimpleCapacitorInput = z.input<typeof source_simple_capacitor>
