import { xor } from "lodash"
import { ChangeEvent, useState } from "react"
import { twMerge } from "tailwind-merge"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { Button } from "./Button"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { StyledText } from "./StyledText"

const { optionalJSONKeys, requiredJSONKeys } = constants

const allRecognizedKeys = [...optionalJSONKeys, ...requiredJSONKeys]

export const BoxForUploadYourFile = () => {
  const {
    dispatch,
    state: { validatedDesposits },
  } = useAppContext()

  const [isDraggingOverTarget, setIsDraggingOverTarget] = useState(false)

  const hasSelectedFile = validatedDesposits.length >= 1

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsDraggingOverTarget(false)

    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const validationErrors: string[] = []

    if (!(file.size < 1024 * 1024)) {
      validationErrors.push("File is too large")
    }

    if (file.type !== "application/json") {
      validationErrors.push("File is not of type application/json")
    }

    if (validationErrors.length >= 1) {
      dispatch({
        type: "setState",
        payload: {
          errorMessages: validationErrors,
        },
      })
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      const rawJSON = String(event.target?.result)
      const parsedJSONObjects = JSON.parse(rawJSON)

      if (!Array.isArray(parsedJSONObjects)) {
        validationErrors.push("File is not an array of objects")
      } else {
        const objectValidationErrors = parsedJSONObjects.reduce<string[]>(
          (accumulatedErrorMessages, currentObject, index) => {
            if (typeof currentObject !== "object") {
              return [
                ...accumulatedErrorMessages,
                `Value of index ${index} is not an object`,
              ]
            }

            const differingPropertyNames = xor(
              allRecognizedKeys,
              Object.keys(currentObject),
            )

            // No unrecognized properties means valid
            if (differingPropertyNames.length === 0) {
              return accumulatedErrorMessages
            }

            return differingPropertyNames.reduce(
              (propertyErrorMessages, propertyName) => {
                if (
                  (requiredJSONKeys as Readonly<string[]>).includes(
                    propertyName,
                  )
                ) {
                  propertyErrorMessages.push(
                    `Object at index ${index} is missing required property "${propertyName}"`,
                  )
                }

                if (!(allRecognizedKeys as string[]).includes(propertyName)) {
                  propertyErrorMessages.push(
                    `Object at index ${index} has unrecognized property "${propertyName}"`,
                  )
                }

                return propertyErrorMessages
              },
              accumulatedErrorMessages,
            )
          },
          [],
        )

        validationErrors.push(...objectValidationErrors)
      }

      if (validationErrors.length >= 1) {
        dispatch({
          type: "setState",
          payload: {
            errorMessages: validationErrors,
          },
        })
        return
      }

      dispatch({
        type: "setState",
        payload: {
          confirmationMessage: "File loaded and passed validation",
          errorMessages: [],
          validatedDesposits: parsedJSONObjects,
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
            <>
              <span>File Loaded</span>
              <Button
                className="text-xs"
                variant="unstyled"
              >
                <Icon name="folder-magnifying-glass" />
                <span>Select Another...</span>
              </Button>
            </>
          ) : (
            <span>
              Upload your <code>deposit_data.json</code> file to&nbsp;proceed
            </span>
          )}
        </StyledText>

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
