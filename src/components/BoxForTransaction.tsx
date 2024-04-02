import { twJoin } from "tailwind-merge"
import { useAppContext } from "../context"
import { Button } from "./Button"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"

export const BoxForTransaction = () => {
  const {
    state: { validatedDeposits },
  } = useAppContext()

  const canSendTransaction = validatedDeposits.length >= 1

  return (
    <LabeledBox
      aria-disabled={canSendTransaction ? undefined : "true"}
      className={twJoin(
        `
          flex
          h-full
          bg-brandColor/5
          transition-opacity
        `,
      )}
      label="Transaction"
    >
      <div
        className="
          flex
          w-full
          flex-col
          items-center
          justify-center
          gap-6
        "
      >
        <Icon
          className="text-8xl text-brandColor/50"
          name="file-signature"
          variant="thin"
        />
        <Button
          disabled={!canSendTransaction}
          variant="primary"
        >
          Sign Transaction
        </Button>
      </div>
    </LabeledBox>
  )
}
