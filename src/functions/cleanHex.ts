export const cleanHex = (allegedHex: string | number, maxLength: number) =>
  String(allegedHex)
    .replace(/[^x0-9a-fA-F]/gi, "")
    .slice(0, maxLength)
