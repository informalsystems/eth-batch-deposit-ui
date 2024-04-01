import { useAppContext } from "../context"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { StyledText } from "./StyledText"

export const BoxForTransactionDetails = () => {
  const {
    state: { validatedDesposits },
  } = useAppContext()

  return (
    <LabeledBox
      className="bg-brandColor/5"
      label="Transaction Details"
      renderLabel={({ renderedLabel }) => (
        <div className="flex items-center justify-between">
          {renderedLabel}

          <div
            className="
              flex
              gap-6
              text-right
            "
          >
            {[
              ["Total holeskyETH to be Staked", "0 holeskyETH"],
              ["Validator Count", validatedDesposits.length],
              ["Excluded PubKey Count", "0"],
            ].map(([label, value]) => (
              <div
                className="
                  flex
                  flex-col-reverse
                  border-r
                  pr-6
                  last:border-r-0
                  last:pr-0
                "
                key={label}
              >
                <StyledText variant="label">{label}</StyledText>
                <StyledText variant="heading3">{value}</StyledText>
              </div>
            ))}
          </div>
        </div>
      )}
    >
      {validatedDesposits.map((deposit) => (
        <div
          className="
            flex
            items-center
            gap-3
            px-6
            py-3
            odd:bg-brandColor/5
          "
          key={deposit.pubkey}
        >
          <Icon name="key-skeleton" />
          <FormattedAddress address={deposit.pubkey as string} />
        </div>
      ))}
    </LabeledBox>
  )
}
