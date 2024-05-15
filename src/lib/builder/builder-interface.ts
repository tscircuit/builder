export interface BuilderInterface {
  builder_type: string
  setProps(props: any): this
  build(...args: any[]): any
}
