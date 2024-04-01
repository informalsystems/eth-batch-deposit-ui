import { Button } from "./Button"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"

export const BoxForTransaction = () => (
  <LabeledBox
    className="
      flex
      h-full
      bg-brandColor/5
    "
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
      <Button variant="primary">Sign Transaction</Button>
    </div>
  </LabeledBox>
)
