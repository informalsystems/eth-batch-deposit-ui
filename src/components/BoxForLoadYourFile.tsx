import { ChangeEvent, useState } from "react"
import { twJoin } from "tailwind-merge"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { Box } from "./Box"
import { Button } from "./Button"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"

export const BoxForLoadYourFile = () => {
  const {
    dispatch,
    state: { connectedAccountAddress, connectedNetworkId, validatedDeposits },
  } = useAppContext()

  const [isDraggingOverTarget, setIsDraggingOverTarget] = useState(false)

  const fileHasErrors = validatedDeposits.some(
    (deposit) => deposit.validationErrors?.length,
  )

  const hasSelectedFile = validatedDeposits.length >= 1

  const showErrorMessage = (message: string) =>
    dispatch({
      type: "showNotification",
      payload: {
        type: "error",
        message,
      },
    })

  const handleLoadFile = (event: ChangeEvent<HTMLInputElement>) => {
    setIsDraggingOverTarget(false)

    const file = event.target.files?.[0]

    if (!file || !connectedAccountAddress || !connectedNetworkId) {
      return
    }

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

      const loadedDataParsedToJSON = JSON.parse(rawJSON) as object | unknown[]

      if (!Array.isArray(loadedDataParsedToJSON)) {
        showErrorMessage("File is not an array of objects")
        return
      }

      if (loadedDataParsedToJSON.length >= constants.maximumDepositsPerFile) {
        showErrorMessage(
          `Number of objects in loaded file exceeds limit of ${constants.maximumDepositsPerFile}`,
        )
        return
      }

      dispatch({
        type: "setState",
        payload: {
          loadedFileContents: rawJSON,
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
      classNameForLabel={twJoin(
        hasSelectedFile
          ? fileHasErrors
            ? `bg-red-500`
            : `bg-emerald-500`
          : `bg-accentColor`,
      )}
      label="Load Your File"
    >
      <Box
        className={[
          `
            group
            relative
            h-full
            w-full
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
              border-emerald-500
              bg-emerald-500
              pt-20
              hover:border-emerald-500
              hover:bg-emerald-500
            `,
          fileHasErrors &&
            `
              border-red-500
              bg-red-500
              hover:border-red-500
              hover:bg-red-500
            `,
          isDraggingOverTarget &&
            `
              is-dragging-over
              dark
              border-brandColor
              bg-brandColor
            `,
        ]}
        variant="centered-column"
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

        <Box variant="accentuated">
          {hasSelectedFile ? (
            <span>File Loaded</span>
          ) : (
            <span>
              Load your <code>deposit_data.json</code> file to&nbsp;proceed
            </span>
          )}
        </Box>

        {hasSelectedFile && (
          <Button
            className={twJoin(
              !fileHasErrors && `opacity-0`,
              `
                text-xs
                transition-opacity
                group-hover:opacity-100
              `,
            )}
            iconLeftName="folder-magnifying-glass"
            variant="unstyled"
          >
            Change File
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
          onChange={handleLoadFile}
        />
      </Box>
    </LabeledBox>
  )
}
