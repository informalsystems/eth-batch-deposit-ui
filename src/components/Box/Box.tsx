import { ElementType } from "react"
import { twMerge } from "tailwind-merge"
import { classNamesByVariant, classNamesForAllVariants } from "./classNames"
import { BoxProps, PolymorphicComponentProp } from "./types"

export const Box = <C extends ElementType = "span">({
  as,
  className,
  children,
  variant,
  ...otherProps
}: PolymorphicComponentProp<C, BoxProps>) => {
  const Component = as ?? "div"

  const classNamesForVariant = variant
    ? Array.isArray(variant)
      ? variant.map((variant) => classNamesByVariant[variant])
      : classNamesByVariant[variant]
    : null

  return (
    <Component
      className={twMerge(
        classNamesForAllVariants,
        classNamesForVariant,
        className,
      )}
      {...otherProps}
    >
      {children}
    </Component>
  )
}
