export const convertAbbrToFType = (abbr: string): string => {
  switch (abbr) {
    case "port":
      return "source_port"
    case "net":
      return "source_net"
    case "power":
      return "simple_power_source"
  }
  return abbr
}
