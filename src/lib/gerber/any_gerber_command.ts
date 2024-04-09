import type { GerberCommandDef } from "./define-gerber-command"
import { z } from "zod"

import { add_attribute_on_aperture } from "./commands/add_attribute_on_aperture"
import { add_attribute_on_file } from "./commands/add_attribute_on_file"
import { add_attribute_on_object } from "./commands/add_attribute_on_object"
import { aperture_block } from "./commands/aperture_block"
import { comment } from "./commands/comment"
import { create_arc } from "./commands/create_arc"
import { define_aperture } from "./commands/define_aperture"
import { define_macro_aperture_template } from "./commands/define_macro_aperture_template"
import { delete_attribute } from "./commands/delete_attribute"
import { end_of_file } from "./commands/end_of_file"
import { end_region_statement } from "./commands/end_region_statement"
import { flash_operation } from "./commands/flash_operation"
import { load_mirroring } from "./commands/load_mirroring"
import { load_polarity } from "./commands/load_polarity"
import { load_rotation } from "./commands/load_rotation"
import { load_scaling } from "./commands/load_scaling"
import { move_operation } from "./commands/move_operation"
import { plot_operation } from "./commands/plot_operation"
import { set_coordinate_format } from "./commands/set_coordinate_format"
import { set_current_aperture_d_code } from "./commands/set_current_aperture_d_code"
import { set_movement_mode_to_clockwise_circular } from "./commands/set_movement_mode_to_clockwise_circular"
import { set_movement_mode_to_counterclockwise_circular } from "./commands/set_movement_mode_to_counterclockwise_circular"
import { set_movement_mode_to_linear } from "./commands/set_movement_mode_to_linear"
import { set_unit } from "./commands/set_unit"
import { start_region_statement } from "./commands/start_region_statement"
import { step_and_repeat } from "./commands/step_and_repeat"
import { format_specification } from "./commands/format_specification"
import { set_layer_polarity } from "./commands/set_layer_polarity"
import { define_aperture_template } from "./commands/define_aperture_template"
import { select_aperture } from "./commands/select_aperture"

export const gerber_command_map = {
  add_attribute_on_aperture,
  add_attribute_on_file,
  add_attribute_on_object,
  aperture_block,
  comment,
  create_arc,
  define_aperture,
  define_macro_aperture_template,
  delete_attribute,
  end_of_file,
  move_operation,
  flash_operation,
  // end_region_statement,
  // flash_operation,
  format_specification,
  // load_mirroring,
  // load_polarity,
  // load_rotation,
  // load_scaling,
  plot_operation,
  // set_coordinate_format,
  // set_current_aperture_d_code,
  define_aperture_template,
  set_movement_mode_to_clockwise_circular,
  set_movement_mode_to_counterclockwise_circular,
  set_movement_mode_to_linear,
  select_aperture,
  set_unit,
  set_layer_polarity,
  // start_region_statement,
  // step_and_repeat,
} as const satisfies Record<string, GerberCommandDef<any, any>>

export type AnyGerberCommand = z.infer<
  (typeof gerber_command_map)[keyof typeof gerber_command_map]["schema"]
>
