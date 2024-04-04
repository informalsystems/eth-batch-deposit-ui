import { twMerge } from "tailwind-merge"

type AsProp<C extends React.ElementType> = {
  as?: C
}

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P)

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = object,
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

interface StyledTextProps {
  variant?: keyof typeof classNamesByVariant
}

const classNamesForAllVariants = `
  text-textColor
  dark:text-white
`

const classNamesByVariant = {
  accentuated: `
    text-lg
    text-brandColor
    dark:text-white
  `,
  code: `
    font-code
    text-inherit
    dark:text-inherit
  `,
  heading1: `
    font-display
    text-6xl
    font-bold
    text-inherit
    dark:text-inherit
  `,
  heading2: `
    font-display
    text-2xl
    font-bold
    text-inherit
    dark:text-inherit
  `,
  heading3: `
    font-display
    text-lg
    font-bold
    text-inherit
    dark:text-inherit
  `,
  label: `
    text-sm
    uppercase
    text-fadedTextColor
    dark:text-white/60
  `,
  link: `
    text-accentColor
    dark:text-white/80
    underline
  `,
}

export const StyledText = <C extends React.ElementType = "span">({
  as,
  className,
  children,
  variant,
  ...otherProps
}: PolymorphicComponentProp<C, StyledTextProps>) => {
  const Component = as ?? "div"

  return (
    <Component
      className={twMerge(
        classNamesForAllVariants,
        variant && classNamesByVariant[variant],
        className,
      )}
      {...otherProps}
    >
      {children}
    </Component>
  )
}
