import { ComponentPropsWithoutRef } from "react"
import { twMerge } from "tailwind-merge"

export { SectionContainer }

interface SectionContainerProps extends ComponentPropsWithoutRef<"section"> {}

const SectionContainer = ({
  children,
  className,
  ...otherProps
}: SectionContainerProps) => {
  return (
    <section
      className={twMerge(
        `
          container
          mx-auto
          px-12
        `,
        className,
      )}
      {...otherProps}
    >
      {children}
    </section>
  )
}
