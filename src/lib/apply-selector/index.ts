import * as Type from "lib/types"
import * as parsel from "parsel-js"
import { convertAbbrToFType } from "./convert-abbr-to-ftype"

/**
 * Filter elements to match the selector, e.g. to access the left port of a
 * resistor you can do ".R1 > port.left"
 */
export const applySelector = (
  elements: Type.AnyElement[],
  selectorRaw: string
): Type.AnyElement[] => {
  const selectorAST = parsel.parse(selectorRaw)
  return applySelectorAST(elements, selectorAST!)
}

const doesElmMatchClassName = (elm: Type.AnyElement, className: string) =>
  ("name" in elm && elm.name === className) ||
  ("port_hints" in elm && elm.port_hints?.includes(className))

export const applySelectorAST = (
  elements: Type.AnyElement[],
  selectorAST: parsel.AST
): Type.AnyElement[] => {
  switch (selectorAST.type) {
    case "complex": {
      switch (selectorAST.combinator) {
        case " ": // TODO technically should do a deep search
        case ">": {
          const { left, right } = selectorAST
          if (left.type === "class" || left.type === "type") {
            // TODO should also check if content matches any element tags
            let matchElms
            if (left.type === "class") {
              matchElms = elements.filter(
                (elm) => "name" in elm && elm.name === left.name
              )
            } else if (left.type === "type") {
              const ftype = convertAbbrToFType(left.name)
              matchElms = elements.filter(
                (elm) => "ftype" in elm && elm.ftype === ftype
              )
            }

            const childrenOfMatchingElms = matchElms.flatMap((matchElm) =>
              elements.filter(
                (elm) =>
                  elm[`${matchElm.type}_id`] ===
                    matchElm[`${matchElm.type}_id`] && elm !== matchElm
              )
            )
            return applySelectorAST(childrenOfMatchingElms, right)
          } else {
            throw new Error(`unsupported selector type "${left.type}" `)
          }
        }
        default: {
          throw new Error(
            `Couldn't apply selector AST for complex combinator "${selectorAST.combinator}"`
          )
        }
      }
      return []
    }
    case "compound": {
      const conditionsToMatch = selectorAST.list.map((part) => {
        switch (part.type) {
          case "class": {
            return (elm) => "name" in elm && elm.name === part.name
          }
          case "type": {
            const name = convertAbbrToFType(part.name)
            return (elm) => elm.type === name
          }
        }
      })

      return elements.filter((elm) =>
        conditionsToMatch.every((condFn) => condFn?.(elm))
      )
    }
    case "type": {
      return elements.filter(
        (elm) =>
          elm.type === selectorAST.name ||
          ("ftype" in elm && elm.ftype === convertAbbrToFType(selectorAST.name))
      )
    }
    case "class": {
      return elements.filter(
        (elm) =>
          // TODO switch to tag sysmtem
          "name" in elm && elm.name === selectorAST.name
      )
    }
    default: {
      throw new Error(
        `Couldn't apply selector AST for type: "${
          selectorAST.type
        }" ${JSON.stringify(selectorAST, null, " ")}`
      )
    }
  }
}
