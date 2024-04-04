import { ComponentPropsWithoutRef, MouseEvent } from "react"
import { twJoin } from "tailwind-merge"
import { AppNotification } from "../types"
import { Icon, IconName, IconVariant } from "./Icon"
import { StyledText } from "./StyledText"

export { Notification }

interface NotificationProps extends ComponentPropsWithoutRef<"div"> {
  iconName?: IconName
  iconVariant?: IconVariant
  variant: AppNotification["type"]
  onDismiss: () => void
}

const classNamesForAllVariants = {
  container: `
    rounded-md
    flex
    items-stretch
    dark
    shadow-lg
    border-2
    border-white
    overflow-hidden
    w-full
  `,

  iconContainer: `
    px-4
    py-3
  `,

  messageContainer: `
    px-6
    py-3
  `,
}

const classNamesByVariant = {
  confirmation: {
    className: {
      container: `
        bg-emerald-500
      `,
      iconContainer: `
        bg-emerald-400
      `,
      messageContainer: ``,
    },
    iconName: "circle-check",
  },
  error: {
    className: {
      container: `
        bg-red-500
      `,
      iconContainer: `
        bg-red-400
      `,
      messageContainer: ``,
    },
    iconName: "triangle-exclamation",
  },
} as const

const Notification = ({
  children,
  variant,
  iconName = classNamesByVariant[variant].iconName,
  iconVariant = "solid",
  onDismiss,
}: NotificationProps) => {
  const handleClickDismiss = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onDismiss()
  }

  return (
    <div
      className={twJoin(
        classNamesForAllVariants.container,
        classNamesByVariant[variant].className.container,
      )}
    >
      <div
        className={twJoin(
          classNamesForAllVariants.iconContainer,
          classNamesByVariant[variant].className.iconContainer,
        )}
      >
        <StyledText>
          <Icon
            name={iconName}
            variant={iconVariant}
          />
        </StyledText>
      </div>
      <div
        className={twJoin(
          classNamesForAllVariants.messageContainer,
          classNamesByVariant[variant].className.messageContainer,
        )}
      >
        <StyledText>{children}</StyledText>
      </div>
      <div>
        <StyledText
          as="button"
          className={classNamesForAllVariants.iconContainer}
          onClick={handleClickDismiss}
        >
          <Icon name="xmark" />
        </StyledText>
      </div>
    </div>
  )
}
