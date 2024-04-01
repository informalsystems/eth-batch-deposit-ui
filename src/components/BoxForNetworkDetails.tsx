import { MouseEvent, useEffect } from "react"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { SupportedNetworkId } from "../types"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { StyledText } from "./StyledText"

export const BoxForNetworkDetails = () => {
  const {
    dispatch,
    state: { account, balance, connectedNetworkId },
  } = useAppContext()

  const isFullyConnected = !!account && !!connectedNetworkId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum

  // Fetch the
  useEffect(() => {
    const setConnectedNetworkId = (networkId: SupportedNetworkId) => {
      dispatch({
        type: "setState",
        payload: {
          connectedNetworkId: networkId,
        },
      })
    }

    const queryChainId = async () => {
      const networkId = await ethereum.request({
        method: "eth_chainId",
      })

      setConnectedNetworkId(networkId)
    }

    queryChainId()

    ethereum.on("chainChanged", setConnectedNetworkId)
  }, [dispatch, ethereum])

  const handleClickSelectNetwork = async (
    { networkId }: { networkId: string },
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkId }],
    })
  }

  return (
    <LabeledBox
      className="
        h-full
        divide-y
        bg-white
        px-6
        *:py-6
      "
      label="Network Details"
      renderLabel={({ renderedLabel }) => (
        <div
          className="
            dark
            flex
            items-center
            justify-between
          "
        >
          {renderedLabel}

          {isFullyConnected && (
            <ul
              className="
                -my-1
                flex
                gap-3
              "
            >
              {Object.entries(constants.networksById).map(([id, { label }]) => {
                const isActive = connectedNetworkId === id

                return (
                  <li key={id}>
                    <Button
                      iconName="hexagon"
                      isActive={isActive}
                      size="small"
                      onClick={handleClickSelectNetwork.bind(null, {
                        networkId: id,
                      })}
                    >
                      {!isActive && "Switch to "} {label}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    >
      {!isFullyConnected && (
        <div
          className="
            flex
            h-full
            items-center
            justify-center
            text-fadedTextColor
          "
        >
          Not Connected
        </div>
      )}
      {isFullyConnected &&
        (
          [
            {
              icon: "id-card-clip",
              label: "Connected Account",
              value: <FormattedAddress address={account} />,
            },
            {
              icon: "wallet",
              label: "Wallet Balance",
              value: `${balance} ${constants.networksById[connectedNetworkId].currency}`,
            },
            {
              icon: "file-contract",
              label: "Deposit Contract",
              value: (
                <FormattedAddress address="0xF78a36B46Ef0e40dc98780cEE56B1D295F68B0eF" />
              ),
            },
            {
              icon: "arrow-up-to-line",
              label: "Max Amount Per Tx",
              value: "1,600 holeskyETH",
            },
          ] as const
        ).map(({ icon, label, value }) => (
          <div
            className="flex gap-6"
            key={label}
          >
            <Icon
              className="text-xl text-brandColor"
              name={icon}
            />

            <div className="flex flex-col-reverse gap-1">
              <StyledText variant="label">{label}</StyledText>
              <StyledText variant="accentuated">{value}</StyledText>
            </div>
          </div>
        ))}
    </LabeledBox>
  )
}
