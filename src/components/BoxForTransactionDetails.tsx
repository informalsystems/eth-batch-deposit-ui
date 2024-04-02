import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { StyledText } from "./StyledText"

export const BoxForTransactionDetails = () => {
  const {
    state: { connectedNetworkId, validatedDeposits },
  } = useAppContext()

  if (!connectedNetworkId) {
    return
  }

  const connectedNetwork = constants.networksById[connectedNetworkId]

  const includedDeposits = validatedDeposits.filter(
    (validatedDeposit) => validatedDeposit.validationErrors?.length === 0,
  )

  const canSendTransaction = includedDeposits.length >= 1

  const renderLabel = ({ renderedLabel }: { renderedLabel: ReactNode }) => (
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
          [
            "Total holeskyETH to be Staked",
            `${includedDeposits.length * 32} ${connectedNetwork.currency}`,
          ],
          ["Validator Count", includedDeposits.length],
          [
            "Excluded PubKey Count",
            validatedDeposits.length - includedDeposits.length,
          ],
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
  )

  return (
    <LabeledBox
      aria-disabled={canSendTransaction ? undefined : "true"}
      className="
        flex
        flex-col
        gap-0
        bg-brandColor/5
      "
      label="Transaction Details"
      renderLabel={renderLabel}
    >
      {validatedDeposits.map((deposit, index) => {
        const validationErrors = deposit.validationErrors ?? []

        const isValid = validationErrors.length === 0

        return (
          <div
            className="odd:bg-brandColor/5"
            key={index}
          >
            <div
              className={twJoin(
                `
                  flex
                  items-center
                `,
                isValid
                  ? `
                      bg-emerald-500/5
                      text-emerald-950
                    `
                  : `
                      bg-red-500/5
                      text-red-950
                    `,
              )}
            >
              <div
                className={twJoin(
                  `
                    flex
                    items-center
                    self-stretch
                    px-6
                  `,
                  isValid ? "bg-emerald-500/10" : "bg-red-500/10",
                )}
              >
                <Icon
                  className={twJoin(
                    isValid ? "text-emerald-500" : "text-red-500",
                  )}
                  name={isValid ? "circle-check" : "circle-xmark"}
                  variant="solid"
                />
              </div>
              <div
                className="
                px-6
                py-3
             "
              >
                <strong>PubKey:</strong>{" "}
                {deposit.pubkey ? (
                  <FormattedAddress address={deposit.pubkey as string} />
                ) : (
                  "Missing"
                )}
                {validationErrors.map((error) => (
                  <div
                    className="
                      ml-6
                      text-sm
                    "
                    key={error}
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </LabeledBox>
  )
}
