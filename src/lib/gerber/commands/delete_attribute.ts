import { z } from "zod"

export const delete_attribute = z
  .object({
    command_code: z.literal("TD"),
    attribute: z.string(),
  })
  .describe(
    "Delete attribute: Attribute delete Delete one or all attributes in the dictionary."
  )

export type DeleteAttribute = z.infer<typeof delete_attribute>
