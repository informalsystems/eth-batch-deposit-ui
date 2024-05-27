import { useAppContext } from "../context"
import { Box } from "./Box"
import { Icon } from "./Icon"

export const LoadingScreen = () => {
  const {
    state: { loadingMessage },
  } = useAppContext()

  return (
    <Box
      className={[
        `
          pointer-events-none
          fixed
          left-0
          top-0
          z-[1000]
          h-full
          w-full
          gap-3
          bg-brandColor/95
          text-white
          opacity-0
          backdrop-blur-sm
          transition-opacity
        `,
        loadingMessage &&
          `
            pointer-events-auto
            opacity-100
          `,
      ]}
      variant="centered-column"
    >
      <Icon
        className="text-4xl"
        name="loader"
        spin
      />
      <span>{loadingMessage}</span>
    </Box>
  )
}
