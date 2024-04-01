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

const classNamesByVariant = {
  accentuated: `
    text-lg
    text-brandColor
    dark:text-white
  `,
  code: `
    font-code
  `,
  heading1: `
    font-display
    text-6xl
    font-bold
  `,
  heading2: `
    font-display
    text-2xl
    font-bold
  `,
  heading3: `
    font-display
    text-lg
    font-bold
  `,
  label: `
    text-sm
    uppercase
    text-fadedTextColor
  `,
  link: `
    text-fadedTextColor
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
      className={twMerge(variant && classNamesByVariant[variant], className)}
      {...otherProps}
    >
      {children}
    </Component>
  )
}
