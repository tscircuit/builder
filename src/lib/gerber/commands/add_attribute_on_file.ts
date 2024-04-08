import { z } from "zod"

export const add_attribute_on_file = z
  .object({
    command_code: z.literal("TF"),
    attribute: z.string(),
  })
  .describe("Add attribute on file: Set a file attribute.")

export type AddAttributeOnFile = z.infer<typeof add_attribute_on_file>
