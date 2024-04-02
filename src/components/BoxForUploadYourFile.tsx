import { xor } from "lodash"
import { ChangeEvent, useState } from "react"
import { twMerge } from "tailwind-merge"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { formatHex } from "../helpers/formatHex"
import { DepositObject } from "../types"
import { Button } from "./Button"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { StyledText } from "./StyledText"

const { optionalJSONKeys, requiredJSONKeys } = constants

const allRecognizedKeys = [...optionalJSONKeys, ...requiredJSONKeys]

export const BoxForUploadYourFile = () => {
  const {
    dispatch,
    state: { account, connectedNetworkId, validatedDeposits },
  } = useAppContext()

  const [isDraggingOverTarget, setIsDraggingOverTarget] = useState(false)

  const hasSelectedFile = validatedDeposits.length >= 1

  const showErrorMessage = (message: string) =>
    dispatch({
      type: "showMessage",
      payload: {
        type: "error",
        message,
      },
    })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsDraggingOverTarget(false)

    const file = event.target.files?.[0]

    if (!file || !account || !connectedNetworkId) {
      return
    }

    const accountSubstr = account.slice(-40).toUpperCase()

    const connectedNetwork = constants.networksById[connectedNetworkId]

    if (!(file.size < 1024 * 1024)) {
      showErrorMessage("File exceeds 1MB limit")
      return
    }

    if (file.type !== "application/json") {
      showErrorMessage("File is not of type application/json")
      return
    }

    const reader = new FileReader()

    reader.onload = async (event) => {
      const rawJSON = String(event.target?.result ?? "[]")
      const uploadedDeposits = JSON.parse(rawJSON) as DepositObject[]

      if (!Array.isArray(uploadedDeposits)) {
        showErrorMessage("File is not an array of objects")
        return
      }

      if (uploadedDeposits.length >= constants.maximumValue) {
        showErrorMessage(
          `Number of objects in uploade file exceeds limit of ${constants.maximumValue}`,
        )
        return
      }

      const uploadedDepositsWithValidationErrors = uploadedDeposits.map(
        (uploadedDeposit) => {
          const validationErrors: string[] = []

          const withdrawalSubstr = String(
            uploadedDeposit.withdrawal_credentials,
          )
            .slice(-40)
            .toUpperCase()

          if (typeof uploadedDeposit !== "object") {
            validationErrors.push(`Not an object`)
          }

          if (
            String(uploadedDeposit.network_name).toLowerCase() !==
            connectedNetwork.label.toLowerCase()
          ) {
            validationErrors.push(
              `Network "${uploadedDeposit.network_name}" does not match connected network "${connectedNetwork.label}"`,
            )
          }

          if (withdrawalSubstr !== accountSubstr) {
            validationErrors.push(
              `withdrawal_credentials does not match current metamask account`,
            )
          }

          const differingPropertyNames = xor(
            allRecognizedKeys,
            Object.keys(uploadedDeposit),
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

          return {
            ...uploadedDeposit,
            validationErrors,
          }
        },
      )

      const validDeposits = uploadedDepositsWithValidationErrors.filter(
        (deposit) => deposit.validationErrors.length === 0,
      )

      const pubkeysInValidDeposits = validDeposits.map(
        (object) => object.pubkey,
      )

      const rawResponseFromFetchDeposits = await fetch(
        `${connectedNetwork.validationURL}/${pubkeysInValidDeposits.join(",")}/deposits`,
      )

      const responseFromFetchDeposits =
        (await rawResponseFromFetchDeposits.json()) ?? {}

      const pubkeysInFetchedDeposits = responseFromFetchDeposits.data.map(
        (fetchedDeposit: { publickey: string }) =>
          formatHex(fetchedDeposit.publickey),
      )

      const uploadedDepositsWithServerValidationErrors =
        uploadedDepositsWithValidationErrors.map((deposit) => {
          if (pubkeysInFetchedDeposits.includes(deposit.pubkey)) {
            deposit.validationErrors.push("Public key has existing deposit(s)")
          }

          return deposit
        })

      dispatch({
        type: "setState",
        payload: {
          validatedDeposits: uploadedDepositsWithServerValidationErrors,
        },
      })

      const hasAnyErrors = uploadedDepositsWithServerValidationErrors.some(
        (deposit) => deposit.validationErrors?.length >= 1,
      )

      dispatch({
        type: "showMessage",
        payload: {
          type: hasAnyErrors ? "error" : "confirmation",
          message: `File loaded ${hasAnyErrors ? "with errors" : "successfully"}`,
        },
      })
    }

    reader.readAsText(file)
  }

  return (
    <LabeledBox
      className="
        flex
        h-full
        flex-col
        items-center
        justify-stretch
        gap-6
        bg-white
        p-6
      "
      classNameForLabel="bg-accentColor"
      label="Upload Your File"
    >
      <div
        className={twMerge(
          `
            group
            relative
            flex
            h-full
            w-full
            flex-col
            items-center
            justify-center
            gap-6
            rounded-xl
            border-2
            border-dashed
            p-6
            text-center
            text-brandColor
            transition-colors
            hover:border-brandColor
            hover:bg-brandColor/5
          `,
          hasSelectedFile &&
            `
              has-selected-file
              dark
              border-solid
              bg-brandColor
              hover:bg-brandColor/90
            `,
          isDraggingOverTarget &&
            `
              is-dragging-over
              dark
              border-brandColor
              bg-brandColor
            `,
        )}
      >
        <Icon
          className="
            text-8xl
            text-brandColor/50
            transition-colors
            group-hover:text-inherit
            group-[&.has-selected-file]:text-white
            group-[&.is-dragging-over]:text-white
          "
          name={hasSelectedFile ? "file-circle-check" : "file-circle-question"}
          variant="thin"
        />

        <StyledText variant="accentuated">
          {hasSelectedFile ? (
            <span>File Loaded</span>
          ) : (
            <span>
              Upload your <code>deposit_data.json</code> file to&nbsp;proceed
            </span>
          )}
        </StyledText>

        {hasSelectedFile && (
          <Button
            className="text-xs"
            iconLeftName="folder-magnifying-glass"
            variant="unstyled"
          >
            Select Another...
          </Button>
        )}

        <input
          className="
            block
            w-full
            text-center
            text-[0]
            file:absolute
            file:bottom-0
            file:left-0
            file:right-0
            file:top-0
            file:z-50
            file:w-full
            file:cursor-pointer
            file:border-0
            file:bg-transparent
            file:text-[0]
          "
          type="file"
          onDragEnter={() => setIsDraggingOverTarget(true)}
          onDragLeave={() => setIsDraggingOverTarget(false)}
          onChange={handleChange}
        />
      </div>
    </LabeledBox>
  )
}
