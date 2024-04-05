import { useCallback, useEffect } from "react"
import { Web3 } from "web3"
import { useAppContext } from "../context"
import { Box } from "./Box"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { SectionContainer } from "./SectionContainer"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ethereum = (window as any).ethereum

export const AppHeader = () => {
  const {
    dispatch,
    state: { connectedAccountAddress },
  } = useAppContext()

  const handleAccountsChanged = useCallback(
    async (accountAddresses: string[]) => {
      const newAccountAddress = accountAddresses[0]

      const web3 = new Web3(ethereum)

      const balanceInWei = await web3.eth.getBalance(newAccountAddress)

      const balanceInEther = web3.utils.fromWei(balanceInWei, "ether")

      const humanReadableBalance = parseFloat(balanceInEther).toFixed(2)

      dispatch({
        type: "setState",
        payload: {
          connectedAccountAddress: newAccountAddress,
          connectedAccountBalance: humanReadableBalance,
        },
      })
    },
    [dispatch],
  )

  const handleClickConnectWallet = async () => {
    if (!ethereum) {
      dispatch({
        type: "showNotification",
        payload: {
          type: "error",
          message: "Please download metamask",
        },
      })
      return
    }

    // Get permission to call eth_accounts
    await ethereum.request({
      method: "eth_requestAccounts",
    })

    const accounts = await ethereum.request({
      method: "eth_accounts",
    })

    handleAccountsChanged(accounts)
  }

  useEffect(() => {
    ethereum.on("accountsChanged", handleAccountsChanged)
  }, [handleAccountsChanged])

  useEffect(() => {
    if (connectedAccountAddress) {
      handleAccountsChanged([connectedAccountAddress])
    }
  }, [connectedAccountAddress, handleAccountsChanged])

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
            src="/images/logo.png"
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
            {!connectedAccountAddress ? (
              <Button
                iconName="wallet"
                onClick={handleClickConnectWallet}
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                <Box variant="label">Wallet Connected</Box>
                <FormattedAddress
                  address={connectedAccountAddress}
                  truncated={true}
                />
              </>
            )}
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
