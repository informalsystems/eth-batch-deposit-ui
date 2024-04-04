export const formatHex = (value: string | number) =>
  String(value).startsWith("0x") ? String(value) : `0x${value}`
