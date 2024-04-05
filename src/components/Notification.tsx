import {
  ComponentPropsWithoutRef,
  MouseEvent,
  useEffect,
  useState,
} from "react"
import { twJoin } from "tailwind-merge"
import { constants } from "../constants"
import { AppNotification } from "../types"
import { Box } from "./Box"
import { Icon, IconName, IconVariant } from "./Icon"

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
    justify-between
    dark
    shadow-lg
    border-2
    border-white
    overflow-hidden
    w-full
    text-white
    relative
  `,

  iconContainer: `
    px-4
    py-3
  `,

  messageContainer: `
    px-6
    py-3
    w-full
    max-h-96
    overflow-y-auto
    [scrollbar-color:white_transparent]
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
  const [hasRendered, setHasRendered] = useState(false)

  const handleClickDismiss = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onDismiss()
  }

  useEffect(() => {
    if (variant === "confirmation") {
      const timer = setTimeout(() => {
        setHasRendered(true)
      }, 1)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [variant])

  return (
    <div
      className={twJoin(
        classNamesForAllVariants.container,
        classNamesByVariant[variant].className.container,
      )}
    >
      {variant === "confirmation" && (
        <div
          className={twJoin(
            `
              absolute
              bottom-0
              left-0
              right-0
              h-1
              origin-left
              scale-x-0
              bg-white
              transition-transform
              ease-linear
            `,
            hasRendered && `scale-x-100`,
          )}
          style={{
            transitionDuration: `${constants.dismissConfirmationNotificationsDelay}ms`,
          }}
        />
      )}

      <div
        className={twJoin(
          classNamesForAllVariants.iconContainer,
          classNamesByVariant[variant].className.iconContainer,
        )}
      >
        <Box>
          <Icon
            name={iconName}
            variant={iconVariant}
          />
        </Box>
      </div>

      <div
        className={twJoin(
          classNamesForAllVariants.messageContainer,
          classNamesByVariant[variant].className.messageContainer,
        )}
      >
        <Box>{children}</Box>
      </div>

      <Box
        as="button"
        className={[
          classNamesForAllVariants.iconContainer,
          `
            absolute
            right-0
            top-0
          `,
        ]}
        onClick={handleClickDismiss}
      >
        <Icon name="xmark" />
      </Box>
    </div>
  )
}
