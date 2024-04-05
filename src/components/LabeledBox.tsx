import { ComponentProps, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { Box } from "./Box"

export const LabeledBox = ({
  children,
  className,
  classNameForLabel,
  label,
  renderLabel,
  ...otherProps
}: ComponentProps<"div"> & {
  classNameForLabel?: ComponentProps<"div">["className"]
  label: ReactNode
  renderLabel?: (context: { renderedLabel: ReactNode }) => ReactNode
}) => {
  const innerRenderedLabel = (
    <Box
      as="h2"
      variant="heading3"
    >
      {label}
    </Box>
  )

  const renderedLabel =
    renderLabel?.({ renderedLabel: innerRenderedLabel }) ?? innerRenderedLabel

  return (
    <div
      className="
        flex
        h-full
        flex-col
        justify-stretch
        overflow-hidden
        rounded-md
        transition-opacity
        [&[aria-disabled]]:pointer-events-none
        [&[aria-disabled]]:opacity-50
      "
      {...otherProps}
    >
      <div
        className={twMerge(
          `
            dark
            bg-brandColor
            px-6
            py-3
            text-white
          `,
          classNameForLabel,
        )}
      >
        {renderedLabel}
      </div>

      <div className={className}>{children}</div>
    </div>
  )
}
