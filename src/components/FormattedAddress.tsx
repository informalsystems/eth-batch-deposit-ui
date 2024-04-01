import { StyledText } from "./StyledText"

export const FormattedAddress = ({
  address,
  leading = 6,
  trailing = 6,
  truncated = false,
}: {
  address: string
  leading?: number
  trailing?: number
  truncated?: boolean
}) => {
  const addressToPrint = truncated
    ? [address.slice(0, leading), address.slice(trailing * -1)].join("...")
    : address

  return (
    <StyledText
      as="span"
      variant="code"
    >
      {addressToPrint.replace(/^0x/, "0×")}
    </StyledText>
  )
}
