import { xor } from "lodash"
import { ReactNode, useEffect } from "react"
import { twJoin } from "tailwind-merge"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { formatHex } from "../functions/formatHex"
import { DepositObject, ValidatedDepositObject } from "../types"
import { Box } from "./Box"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"

const { optionalJSONKeys, requiredJSONKeys } = constants

export const BoxForTransactionDetails = () => {
  const {
    dispatch,
    state: {
      connectedAccountAddress,
      connectedNetworkId,
      loadedFileContents,
      previouslyDepositedPubkeys,
      validatedDeposits,
    },
  } = useAppContext()

  // When the network, loaded file contents, or the connected wallet
  // changes, re-validate the file contents
  useEffect(() => {
    if (
      !(connectedAccountAddress && connectedNetworkId && loadedFileContents)
    ) {
      return
    }

    const setValidatedDeposits = (
      validatedDeposits: ValidatedDepositObject[],
    ) =>
      dispatch({
        type: "setState",
        payload: {
          validatedDeposits,
          withdrawalCredentials: String(
            validatedDeposits[0].withdrawal_credentials,
          )?.replace(/^010000000000000000000000/, "0x"),
        },
      })

    const showErrorMessage = (message: string) =>
      dispatch({
        type: "showNotification",
        payload: {
          type: "error",
          message,
        },
      })

    const validateLoadedFileContents = async () => {
      const formattedAccount = connectedAccountAddress
        .replace(/^0x/, "010000000000000000000000")
        .toLowerCase()

      const allRecognizedKeys = [...optionalJSONKeys, ...requiredJSONKeys]

      const connectedNetwork =
        constants.networksById[
          connectedNetworkId as keyof typeof constants.networksById
        ]

      const loadedDataParsedToJSON = JSON.parse(
        loadedFileContents,
      ) as DepositObject[]

      const loadedObjectsWithValidationErrors = loadedDataParsedToJSON.map(
        (loadedObject) => {
          const validationErrors: string[] = []

          if (typeof loadedObject !== "object") {
            validationErrors.push(
              `Not an object. Type is "${typeof loadedObject}"`,
            )
            return { validationErrors }
          }

          const differingPropertyNames = xor(
            allRecognizedKeys,
            Object.keys(loadedObject),
          )

          differingPropertyNames.forEach((propertyName) => {
            if (
              (requiredJSONKeys as Readonly<string[]>).includes(propertyName)
            ) {
              validationErrors.push(
                `Object is missing required property "${propertyName}"`,
              )
            }

            if (!(allRecognizedKeys as string[]).includes(propertyName)) {
              validationErrors.push(
                `Object has unrecognized property "${propertyName}"`,
              )
            }
          })

          // No errors so far? Then we can actually validate as if they're
          // well-formed deposit objects
          if (validationErrors.length === 0) {
            if (!String(loadedObject.pubkey).match(/^[0-9a-fA-F]{96}$/)) {
              validationErrors.push(`Pubkey is invalid`)
            }

            if (
              previouslyDepositedPubkeys.includes(
                formatHex(loadedObject.pubkey, 96),
              )
            ) {
              validationErrors.push(`Pubkey has received deposit already`)
            }

            if (
              Number(loadedObject.amount) !== constants.requiredDepositAmount
            ) {
              validationErrors.push(`Deposit amount is incorrect`)
            }

            if (!String(loadedObject.signature).match(/^[0-9a-fA-F]{192}$/)) {
              validationErrors.push(`Deposit signature is invalid`)
            }

            if (
              !String(loadedObject.deposit_message_root).match(
                /^[0-9a-fA-F]{64}$/,
              )
            ) {
              validationErrors.push(`Deposit message root is invalid`)
            }

            if (
              !String(loadedObject.deposit_data_root).match(/^[0-9a-fA-F]{64}$/)
            ) {
              validationErrors.push(`Deposit data root is invalid`)
            }

            if (
              String(loadedObject.network_name).toLowerCase() !==
              connectedNetwork.label.toLowerCase()
            ) {
              validationErrors.push(
                `Network "${loadedObject.network_name}" does not match connected network "${connectedNetwork.label}"`,
              )
            }

            const formattedWithdrawalCredentials = String(
              loadedObject.withdrawal_credentials,
            ).toLowerCase()

            if (formattedWithdrawalCredentials !== formattedAccount) {
              const showErrorMessage = (message: string) =>
                dispatch({
                  type: "showNotification",
                  payload: {
                    type: "error",
                    message,
                  },
                })

              showErrorMessage(
                "Withdrawal credentials do not match connected wallet. Proceed with caution! withdrawal_credentials: " +
                  formattedWithdrawalCredentials.slice(24),
              )
            }

            if (
              !formattedWithdrawalCredentials.startsWith(
                "010000000000000000000000",
              ) ||
              formattedWithdrawalCredentials.length !== 64 ||
              !formattedWithdrawalCredentials.match(/^[0-9a-fA-F]{64}$/)
            ) {
              validationErrors.push(`withdrawal_credentials address is invalid`)
            }

            if (loadedObject.fork_version !== connectedNetwork.forkVersion) {
              validationErrors.push(
                `fork_version does not match connected network`,
              )
            }
          }

          return {
            ...loadedObject,
            validationErrors,
          }
        },
      ) as ValidatedDepositObject[]

      // Any objects without errors must be well-formed deposit objects
      const validDeposits = loadedObjectsWithValidationErrors.filter(
        (deposit) => deposit.validationErrors.length === 0,
      ) as ValidatedDepositObject[]

      if (validDeposits.length === 0) {
        setValidatedDeposits(loadedObjectsWithValidationErrors)
        showErrorMessage("File loaded with errors")
        return
      }

      const pubkeysInValidDeposits = validDeposits.map(
        (object) => object.pubkey,
      )

      const rawResponseFromFetchDeposits = await fetch(
        `${connectedNetwork.validationURL}/${pubkeysInValidDeposits.join(",")}/deposits`,
      )

      if (!rawResponseFromFetchDeposits.ok) {
        setValidatedDeposits(
          loadedObjectsWithValidationErrors.map((deposit) => ({
            ...deposit,
            validationErrors: [
              ...deposit.validationErrors,
              "Could not fetch deposits",
            ],
          })) as ValidatedDepositObject[],
        )
        showErrorMessage("Failed trying to fetch deposits")
        return
      }

      const responseFromFetchDeposits =
        (await rawResponseFromFetchDeposits.json()) ?? {}

      // pubkey needs to be maxLength 98 with 0x
      const pubkeysInFetchedDeposits = responseFromFetchDeposits.data.map(
        (fetchedDeposit: { publickey: string }) =>
          formatHex(fetchedDeposit.publickey, 98),
      )

      const loadedDepositsWithServerValidationErrors =
        loadedObjectsWithValidationErrors.map((deposit) => {
          if (
            "pubkey" in deposit &&
            deposit.pubkey &&
            pubkeysInFetchedDeposits.includes(formatHex(deposit.pubkey, 98))
          ) {
            deposit.validationErrors.push("Public key has existing deposit(s)")
          }

          return deposit
        })

      setValidatedDeposits(loadedDepositsWithServerValidationErrors)

      const hasAnyErrors = loadedDepositsWithServerValidationErrors.some(
        (deposit) => deposit.validationErrors?.length >= 1,
      )

      dispatch({
        type: "showNotification",
        payload: {
          type: hasAnyErrors ? "error" : "confirmation",
          message: `File loaded ${hasAnyErrors ? "with errors" : "successfully"}`,
        },
      })
    }

    validateLoadedFileContents()
  }, [
    connectedAccountAddress,
    connectedNetworkId,
    dispatch,
    loadedFileContents,
    previouslyDepositedPubkeys,
  ])

  if (!connectedNetworkId) {
    return
  }

  const connectedNetwork =
    constants.networksById[
      connectedNetworkId as keyof typeof constants.networksById
    ]

  const includedDeposits = validatedDeposits.filter(
    (validatedDeposit) => validatedDeposit.validationErrors?.length === 0,
  )

  const hasAnythingToShow = validatedDeposits.length >= 1

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
            `Total ${connectedNetwork.currency} to be Staked`,
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
            <Box variant="label">{label}</Box>
            <Box variant="heading3">{value}</Box>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <LabeledBox
      aria-disabled={hasAnythingToShow ? undefined : "true"}
      className="
        flex
        flex-col
        gap-px
        bg-brandColor/5
        pt-px
      "
      label="Transaction Details"
      renderLabel={renderLabel}
    >
      {validatedDeposits.map((deposit, index) => {
        const validationErrors = deposit.validationErrors ?? []

        const isValid = validationErrors.length === 0

        return (
          <div key={index}>
            <div
              className={twJoin(
                `
                  flex
                  items-center
                  text-white
                `,
                isValid
                  ? `
                      bg-emerald-500/90
                      text-emerald-950
                    `
                  : `
                      bg-red-500/90
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
                  isValid ? "bg-emerald-600/50" : "bg-red-600/50",
                )}
              >
                <Icon
                  className={twJoin(
                    isValid ? "text-emerald-50" : "text-red-50",
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
