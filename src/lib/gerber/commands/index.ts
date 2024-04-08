import { z } from "zod"

export const comment = z
  .object({
    command_code: z.literal("G04"),
    comment: z.string(),
  })
  .describe("Comment: A human readable comment, does not affect the image. 4.1")
export type Comment = z.infer<typeof comment>

export const set_unit = z
  .object({
    command_code: z.literal("MO"),
    unit: z.enum(["mm", "in"]),
  })
  .describe("Mode: Sets the unit to mm or inch. 4.2.1")
export type SetUnit = z.infer<typeof set_unit>

export const set_coordinate_format = z
  .object({
    command_code: z.literal("FS"),
    format: z.string(),
  })
  .describe("Sets the coordinate format, e.g. the number of decimals.")
export type SetCoordinateFormat = z.infer<typeof set_coordinate_format>

export const define_aperture = z
  .object({
    command_code: z.literal("AD"),
    aperture_code: z.string(),
  })
  .describe(
    "Aperture define: Defines a template-based aperture, assigns a D code to it. 4.3"
  )
export type DefineAperture = z.infer<typeof define_aperture>

export const define_macro_aperture_template = z
  .object({
    command_code: z.literal("AM"),
    template_code: z.string(),
  })
  .describe("Aperture macro: Defines a macro aperture template. 4.5")

export type DefineMacroApertureTemplate = z.infer<
  typeof define_macro_aperture_template
>

export const set_current_aperture_d_code = z
  .object({
    command_code: z.literal("Dnn"),
    d_code: z.string(),
  })
  .describe("(nn≥10) Sets the current aperture to D code nn. 4.6")

export type SetCurrentApertureDCode = z.infer<
  typeof set_current_aperture_d_code
>

export const plot_operation = z
  .object({
    command_code: z.literal("D01"),
    operation: z.string(),
  })
  .describe(
    "Plot operation: Outside a region statement D01 creates a draw or arc object with the current aperture. Inside it adds a draw/arc segment to the contour under construction. The current point is moved to draw/arc end point after the creation of the draw/arc."
  )

export type PlotOperation = z.infer<typeof plot_operation>

export const move_operation = z
  .object({
    command_code: z.literal("D02"),
    coordinates: z.string(),
  })
  .describe(
    "Move operation: D02 moves the current point to the coordinate in the command. It does not create an object."
  )

export type MoveOperation = z.infer<typeof move_operation>

export const flash_operation = z
  .object({
    command_code: z.literal("D03"),
    coordinates: z.string(),
  })
  .describe(
    "Flash operation: Creates a flash object with the current aperture. The current point is moved to the flash point."
  )

export type FlashOperation = z.infer<typeof flash_operation>

export const set_movement_mode_to_linear = z
  .object({
    command_code: z.literal("G01"),
    mode: z.string(),
  })
  .describe("Set movement mode to linear: Sets linear/circular mode to linear.")

export type SetMovementModeToLinear = z.infer<
  typeof set_movement_mode_to_linear
>

export const set_movement_mode_to_clockwise_circular = z
  .object({
    command_code: z.literal("G02"),
    mode: z.string(),
  })
  .describe(
    "Set movement mode to clockwise circular: Sets linear/circular mode to clockwise circular."
  )

export type SetMovementModeToClockwiseCircular = z.infer<
  typeof set_movement_mode_to_clockwise_circular
>

export const set_movement_mode_to_counterclockwise_circular = z
  .object({
    command_code: z.literal("G03"),
    mode: z.string(),
  })
  .describe(
    "Set movement mode to counterclockwise circular: Sets linear/circular mode to counterclockwise circular."
  )

export type SetMovementModeToCounterclockwiseCircular = z.infer<
  typeof set_movement_mode_to_counterclockwise_circular
>

export const create_arc = z
  .object({
    command_code: z.literal("G75"),
    arc_parameters: z.string(),
  })
  .describe("Create arc: A G75 must be called before creating the first arc.")

export type CreateArc = z.infer<typeof create_arc>

export const load_polarity = z
  .object({
    command_code: z.literal("LP"),
    polarity: z.string(),
  })
  .describe(
    "Load polarity: Loads the polarity object transformation parameter."
  )

export type LoadPolarity = z.infer<typeof load_polarity>

export const load_mirroring = z
  .object({
    command_code: z.literal("LM"),
    mirroring: z.string(),
  })
  .describe("Load mirroring: Loads the mirror object transformation parameter.")

export type LoadMirroring = z.infer<typeof load_mirroring>

export const load_rotation = z
  .object({
    command_code: z.literal("LR"),
    rotation: z.string(),
  })
  .describe(
    "Load rotation: Loads the rotation object transformation parameter."
  )

export type LoadRotation = z.infer<typeof load_rotation>

export const load_scaling = z
  .object({
    command_code: z.literal("LS"),
    scaling: z.string(),
  })
  .describe("Load scaling: Loads the scale object transformation parameter.")

export type LoadScaling = z.infer<typeof load_scaling>

export const start_region_statement = z
  .object({
    command_code: z.literal("G36"),
    statement: z.string(),
  })
  .describe(
    "Start region statement: Starts a region statement which creates a region by defining its contours."
  )

export type StartRegionStatement = z.infer<typeof start_region_statement>

export const end_region_statement = z
  .object({
    command_code: z.literal("G37"),
    statement: z.string(),
  })
  .describe("End region statement: Ends the region statement")

export type EndRegionStatement = z.infer<typeof end_region_statement>

export const aperture_block = z
  .object({
    command_code: z.literal("AB"),
    block: z.string(),
  })
  .describe(
    "Aperture block: Opens a block aperture statement and assigns its aperture number or closes a block aperture statement"
  )

export type ApertureBlock = z.infer<typeof aperture_block>

export const step_and_repeat = z
  .object({
    command_code: z.literal("SR"),
    statement: z.string(),
  })
  .describe("Step and repeat: Open or closes a step and repeat statement.")

export type StepAndRepeat = z.infer<typeof step_and_repeat>

export const add_attribute_on_file = z
  .object({
    command_code: z.literal("TF"),
    attribute: z.string(),
  })
  .describe("Add attribute on file: Set a file attribute.")

export type AddAttributeOnFile = z.infer<typeof add_attribute_on_file>

export const add_attribute_on_aperture = z
  .object({
    command_code: z.literal("TA"),
    attribute: z.string(),
  })
  .describe(
    "Add attribute on aperture: Add an aperture attribute to the dictionary or modify it."
  )

export type AddAttributeOnAperture = z.infer<typeof add_attribute_on_aperture>

export const add_attribute_on_object = z
  .object({
    command_code: z.literal("TO"),
    attribute: z.string(),
  })
  .describe(
    "Add attribute on object: Add an object attribute to the dictionary or modify it."
  )

export type AddAttributeOnObject = z.infer<typeof add_attribute_on_object>

export const delete_attribute = z
  .object({
    command_code: z.literal("TD"),
    attribute: z.string(),
  })
  .describe(
    "Delete attribute: Attribute delete Delete one or all attributes in the dictionary."
  )

export type DeleteAttribute = z.infer<typeof delete_attribute>

export const end_of_file = z
  .object({
    command_code: z.literal("M02"),
    statement: z.string(),
  })
  .describe("End of file: 4.13")

export type EndOfFile = z.infer<typeof end_of_file>
