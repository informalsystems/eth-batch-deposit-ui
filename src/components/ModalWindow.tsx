import { ComponentPropsWithoutRef, MouseEvent } from "react"
import { createPortal } from "react-dom"
import { twMerge } from "tailwind-merge"
import { Icon } from "./Icon"

export { ModalWindow }
export type { ModalWindowProps }

interface ModalWindowProps extends ComponentPropsWithoutRef<"div"> {
  isOpen: boolean
  onClose: () => void
}

const ModalWindow = ({
  children,
  className,
  isOpen,
  onClose,
  ...otherProps
}: ModalWindowProps) => {
  const handleClickClose = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onClose()
  }

  return createPortal(
    <div
      className={twMerge(
        `
          dark
          relative
          z-50
          transition-opacity
        `,
        isOpen
          ? `
              pointer-events-auto
              opacity-100
            `
          : `
              pointer-events-none
              opacity-0
            `,
        className,
      )}
      {...otherProps}
    >
      <div
        className="
          fixed
          left-0
          top-0
          z-40
          h-full
          w-full
          bg-neutral-950/90
          backdrop-blur-sm
        "
      />

      <div
        className="
          fixed
          left-1/2
          top-1/2
          z-50
          flex
          max-h-[90vh]
          min-w-96
          max-w-screen-sm
          -translate-x-1/2
          -translate-y-1/2
          flex-col
          justify-stretch
          gap-6
          overflow-auto
          rounded-lg
          border
          bg-brandColor
          p-6
          text-white
        "
      >
        <button
          className="
            absolute
            right-3
            top-3
          "
        >
          <Icon
            name="xmark"
            onClick={handleClickClose}
          />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  )
}
