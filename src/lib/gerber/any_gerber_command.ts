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

export const any_gerber_command = z.union([
  add_attribute_on_aperture,
  add_attribute_on_file,
  add_attribute_on_object,
  aperture_block,
  comment.schema,
  create_arc,
  define_aperture,
  define_macro_aperture_template,
  delete_attribute,
  end_of_file,
  end_region_statement,
  flash_operation,
  load_mirroring,
  load_polarity,
  load_rotation,
  load_scaling,
  move_operation,
  plot_operation,
  set_coordinate_format,
  set_current_aperture_d_code,
  set_movement_mode_to_clockwise_circular,
  set_movement_mode_to_counterclockwise_circular,
  set_movement_mode_to_linear,
  set_unit,
  start_region_statement,
  step_and_repeat,
])

export type AnyGerberCommand = z.infer<typeof any_gerber_command>
