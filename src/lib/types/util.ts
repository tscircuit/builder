import { Simplify } from "type-fest"

// Currently, removing uncommon SI Prefixes for type simplicity.
export type SIPrefix =
  // | "y"
  // | "yocto"
  // | "z"
  // | "zepto"
  // | "atto"
  // | "a"
  | "femto"
  | "f"
  | "u"
  | "micro"
  // | "d"
  // | "deci"
  | "c"
  | "centi"
  | "m"
  | "milli"
  | "k"
  | "kilo"
  | "M"
  | "mega"
// | "G"
// | "T"
// | "P"
// | "E"
// | "Z"
// | "Y"

export type UnitAbbreviations = {
  farad: "F"
  ohm: "Ω"
  henry: "H"
  meter: "m"
  volt: "V"
  inch: "in"
  foot: "ft"
}

export type Unit = keyof UnitAbbreviations

export type UnitOrAbbreviation = UnitAbbreviations[Unit] | Unit

export type NumberWithAnyUnit =
  | `${number}${UnitOrAbbreviation}`
  | `${number} ${UnitOrAbbreviation}`
  | `${number}${SIPrefix}${UnitOrAbbreviation}`
  | `${number} ${SIPrefix}${UnitOrAbbreviation}`

export type NumberWithUnit<T extends Unit> =
  | `${number}${T | UnitAbbreviations[T]}`
  | `${number} ${T | UnitAbbreviations[T]}`
  | `${number}${SIPrefix}${T | UnitAbbreviations[T]}`
  | `${number} ${SIPrefix}${T | UnitAbbreviations[T]}`

export type Dimension = number | NumberWithUnit<"meter" | "inch" | "foot">
