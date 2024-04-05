import { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react"
import { ClassNameValue } from "tailwind-merge"
import { classNamesByVariant } from "./classNames"

export type AsProp<C extends ElementType> = {
  as?: C
}

export type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P)

export type PolymorphicComponentProp<
  C extends ElementType,
  Props = object,
> = PropsWithChildren<Props & AsProp<C>> &
  Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

export type BoxVariant = keyof typeof classNamesByVariant

export interface BoxProps {
  className?: ClassNameValue | ClassNameValue[]
  variant?: BoxVariant | BoxVariant[]
}
