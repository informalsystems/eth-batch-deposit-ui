import { useEffect } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { useAppContext } from "../context"
import { cleanHex } from "../functions/cleanHex"
import { Box } from "./Box"
import { SectionContainer } from "./SectionContainer"

export const AppHeader = () => {
  const { dispatch } = useAppContext()

  const { address } = useAccount()

  const balance = useBalance({
    address,
  })

  const chainId = useChainId()

  useEffect(() => {
    dispatch({
      type: "setState",
      payload: {
        connectedAccountAddress: address ? cleanHex(address, 42) : null,
      },
    })
  }, [address, dispatch])

  useEffect(() => {
    const balanceValue = Number(balance.data?.value ?? 0)
    const balanceNumDecimals = balance.data?.decimals ?? 0

    dispatch({
      type: "setState",
      payload: {
        connectedAccountBalance: (
          balanceValue /
          10 ** balanceNumDecimals
        ).toFixed(4),
      },
    })
  }, [balance, dispatch])

  useEffect(() => {
    dispatch({
      type: "setState",
      payload: {
        connectedNetworkId: chainId,
      },
    })
  }, [chainId, dispatch])

  return (
    <header
      className="
        dark
        bg-brandColor
        text-white
      "
    >
      <SectionContainer
        className="
          space-y-8
          pb-12
          pt-6
        "
      >
        <div
          className="
            flex
            justify-between
            gap-6
          "
        >
          <img
            className="size-16"
            alt="logo"
            src="/batch-deposit/images/logo.png"
          />

          <nav>
            <ul
              className="
                flex
                gap-6
              "
            >
              {[
                { href: "#", label: "informal systems" },
                { href: "#", label: "rewards dashboard" },
                { href: "#", label: "stake with us" },
                { href: "#", label: "batch deposit" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a
                    className="
                      uppercase
                      text-fadedTextColor
                      hover:text-white
                    "
                    href={href}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-right">
            <w3m-button />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="max-w-prose space-y-3">
            <Box
              as="h1"
              variant="heading1"
            >
              Batch Deposit Ethereum&nbsp;Validators
            </Box>

            <p className="italic">Powered by Informal Systems</p>
          </div>

          <div
            className="
              space-y-3
              rounded-md
              border-white
              bg-white/10
              px-8
              py-6
            "
          >
            <Box
              as="h2"
              variant="heading2"
            >
              Welcome!
            </Box>

            <Box variant="numbered-list">
              <li>Select your Network</li>
              <li>
                Load your&nbsp; <code>deposit_data.json</code>
              </li>
              <li>Confirm and sign transaction</li>
            </Box>
          </div>
        </div>
      </SectionContainer>
    </header>
  )
}
