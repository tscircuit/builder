type Combined<T> = {
  [P in string]?: P extends keyof T ? T[P] : any
}

export const combined = <T>(obj: T): Combined<T> => obj as Combined<T>
