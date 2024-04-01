import { useAppContext } from "../context"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { SectionContainer } from "./SectionContainer"
import { StyledText } from "./StyledText"

export const AppHeader = () => {
  const {
    dispatch,
    state: { account },
  } = useAppContext()

  const handleClickConnectWallet = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum

    //check metamask is installed
    if (ethereum) {
      // Get permission to call eth_accounts
      await ethereum.request({
        method: "eth_requestAccounts",
      })

      const accounts = await ethereum.request({
        method: "eth_accounts",
      })

      const firstAccountAddress = accounts[0]

      const balance = await ethereum.request({
        method: "eth_getBalance",
        params: [firstAccountAddress],
      })

      //show the first connected account in the react page
      dispatch({
        type: "setState",
        payload: {
          account: firstAccountAddress,
          balance,
        },
      })
    } else {
      alert("Please download metamask")
    }
  }

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
            {!account ? (
              <Button
                iconName="wallet"
                onClick={handleClickConnectWallet}
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                <StyledText variant="label">Wallet Connected</StyledText>
                <FormattedAddress
                  address={account}
                  truncated={true}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="max-w-prose space-y-3">
            <StyledText
              as="h1"
              variant="heading1"
            >
              Batch Deposit Ethereum&nbsp;Validators
            </StyledText>

            <p className="italic">Powered by Informal Systems</p>
          </div>

          <div
            className="
              space-y-3
              rounded-md
              border
              border-white
              px-8
              py-6
            "
          >
            <StyledText
              as="h2"
              variant="heading2"
            >
              Welcome!
            </StyledText>

            <ol
              className="
                space-y-3
                pl-8
                text-sm
                [counter-reset:list]
                *:relative
                *:flex
                *:items-center
                *:pl-3
                *:[counter-increment:list]
                *:before:absolute
                *:before:right-full
                *:before:flex
                *:before:size-7
                *:before:items-center
                *:before:justify-center
                *:before:rounded-full
                *:before:border
                *:before:border-white
                *:before:content-[counters(list,'')]
              "
            >
              <li>Select your Network</li>
              <li>
                Upload your&nbsp; <code>deposit_data.json</code>
              </li>
              <li>Confirm and sign transaction</li>
            </ol>
          </div>
        </div>
      </SectionContainer>
    </header>
  )
}
