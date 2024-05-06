export interface BuilderInterface {
  builder_type: string

  build(...args: any[]): any
}
