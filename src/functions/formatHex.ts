import { cleanHex } from "./cleanHex"

export const formatHex = (value: string | number, length: number) => {
  const cleanedHex = cleanHex(`${value}`, length)
  return cleanedHex.startsWith("0x") ? cleanedHex : `0x${cleanedHex}`
}
