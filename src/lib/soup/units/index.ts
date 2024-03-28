import { z } from "zod"

// // Currently, removing uncommon SI Prefixes for type simplicity.
// export type SIPrefix =
//   // | "y"
//   // | "yocto"
//   // | "z"
//   // | "zepto"
//   // | "atto"
//   // | "a"
//   | "femto"
//   | "f"
//   | "u"
//   | "micro"
//   // | "d"
//   // | "deci"
//   | "c"
//   | "centi"
//   | "m"
//   | "milli"
//   | "k"
//   | "kilo"
//   | "M"
//   | "mega"
// // | "G"
// // | "T"
// // | "P"
// // | "E"
// // | "Z"
// // | "Y"

// export type UnitAbbreviations = {
//   farad: "F"
//   ohm: "Ω"
//   henry: "H"
//   meter: "m"
//   volt: "V"
//   inch: "in"
//   foot: "ft"
// }

// export type Unit = keyof UnitAbbreviations
// export type NumberWithUnit<T extends Unit> =
//   | `${number}${T | UnitAbbreviations[T]}`
//   | `${number} ${T | UnitAbbreviations[T]}`
//   | `${number}${SIPrefix}${T | UnitAbbreviations[T]}`
//   | `${number} ${SIPrefix}${T | UnitAbbreviations[T]}`
// export type NumberWithAnyUnit =
//   | `${number}${UnitOrAbbreviation}`
//   | `${number} ${UnitOrAbbreviation}`
//   | `${number}${SIPrefix}${UnitOrAbbreviation}`
//   | `${number} ${SIPrefix}${UnitOrAbbreviation}`

export const resistance = z.string().or(z.number())
export const capacitance = z.string().or(z.number())
export const inductance = z.string().or(z.number())
export const voltage = z.string().or(z.number())
export const length = z.string().or(z.number())
export const current = z.string().or(z.number())
export const time = z.string().or(z.number())
export const rotation = z.string().or(z.number())
