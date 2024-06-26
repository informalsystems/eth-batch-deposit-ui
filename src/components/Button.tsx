import { ComponentProps } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { Icon, IconName, IconVariant } from "./Icon"

interface ButtonProps extends ComponentProps<"button"> {
  iconName?: IconName
  iconVariant?: IconVariant
  iconLeftName?: IconName
  iconRightName?: IconName
  iconLeftVariant?: IconVariant
  iconRightVariant?: IconVariant
  isActive?: boolean
  size?: keyof typeof classNamesBySize
  variant?: keyof typeof classNamesByVariant
}

const classNamesForAllVariants = `
  flex
  w-fit
  items-center
  rounded-lg
  transition-all
  hover:scale-105
  disabled:pointer-events-none
  disabled:cursor-not-allowed
  disabled:opacity-30
  whitespace-nowrap
`

const classNamesForIconContainers = `
  flex
  items-center
  justify-center
`

const classNamesBySize = {
  default: {
    label: `
      px-6
      py-3
    `,
    icon: `
      py-3
      px-4
    `,
  },

  small: {
    label: `
      px-3
      py-1
      text-sm
    `,
    icon: `
      py-1
      px-2
    `,
  },
}

const classNamesByVariant = {
  default: {
    container: `
      border-2
      border-brandColor
      text-brandColor
      dark:border-white
      dark:text-white
      [&.is-active]:bg-brandColor
      [&.is-active]:text-white
      dark:[&.is-active]:bg-white
      dark:[&.is-active]:text-brandColor
    `,
    icon: `
      bg-white/20
      group-[&.is-active]/button:border-r
    `,
  },

  primary: {
    container: `
      bg-brandColor
      text-white
      dark:bg-white
      dark:text-brandColor
      [&.is-active]:bg-brandColor
      [&.is-active]:text-white
      dark:[&.is-active]:bg-white
      dark:[&.is-active]:text-brandColor
    `,
    icon: `
      dark:group-[&.is-active]:bg-brandColor
    `,
  },

  unstyled: {
    container: `
      gap-1
      dark:text-white
    `,
    icon: ``,
  },
}

export const Button = ({
  children,
  className,
  iconName,
  iconVariant,
  iconLeftName = iconName,
  iconLeftVariant = iconVariant,
  iconRightName,
  iconRightVariant = iconVariant,
  isActive,
  size = "default",
  variant = "default",
  ...otherProps
}: ButtonProps) => {
  const isUsingActiveState = typeof isActive === "boolean"

  const classNamesForIconAtSize =
    variant !== "unstyled" ? classNamesBySize[size].icon : ``

  const classNamesForLabelAtSize =
    variant !== "unstyled" ? classNamesBySize[size].label : ``

  return (
    <button
      className={twMerge(
        typeof isActive === "boolean" &&
          `
            opacity-50
            transition-opacity
          `,
        isActive &&
          `
            group/button
            is-active
            opacity-100
          `,
        classNamesForAllVariants,
        classNamesByVariant[variant].container,
        className,
      )}
      {...otherProps}
    >
      {iconLeftName && (
        <div
          className={twJoin(
            classNamesForIconContainers,
            classNamesByVariant[variant].icon,
            classNamesForIconAtSize,
          )}
        >
          <Icon
            name={iconLeftName}
            variant={isUsingActiveState ? "solid" : iconLeftVariant}
          />
        </div>
      )}

      <div className={classNamesForLabelAtSize}>{children}</div>

      {iconRightName && (
        <div
          className={twJoin(
            classNamesForIconContainers,
            classNamesByVariant[variant].icon,
            classNamesForIconAtSize,
          )}
        >
          <Icon
            name={iconRightName}
            variant={isUsingActiveState ? "solid" : iconRightVariant}
          />
        </div>
      )}
    </button>
  )
}
