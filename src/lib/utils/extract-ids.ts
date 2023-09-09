import * as Type from "lib/types"

export const extractIds = (
  elm: any
): Partial<Record<`${Type.ElementType}_id`, string>> => {
  let ids = {}
  for (let key in elm) {
    if (key.endsWith("_id")) {
      ids[key] = elm[key]
    }
  }
  return ids
}
