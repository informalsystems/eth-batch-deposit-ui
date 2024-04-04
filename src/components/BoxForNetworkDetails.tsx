import { MouseEvent, useEffect } from "react"
import { Web3 } from "web3"
import abi from "../abi.json"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { SupportedNetworkId } from "../types"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { StyledText } from "./StyledText"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ethereum = (window as any).ethereum

export const BoxForNetworkDetails = () => {
  const {
    dispatch,
    state: { account, balance, connectedNetworkId },
  } = useAppContext()

  const isFullyConnected = !!account && !!connectedNetworkId

  const connectedNetwork = isFullyConnected
    ? constants.networksById[connectedNetworkId]
    : null

  useEffect(() => {
    const showErrorMessage = (message: string) =>
      dispatch({
        type: "showNotification",
        payload: {
          type: "error",
          message,
        },
      })

    const handleChainChanged = (networkId: SupportedNetworkId) => {
      const web3 = new Web3(ethereum)

      // Wipe out any state that was based on the network
      dispatch({
        type: "setState",
        payload: {
          notifications: [],
          connectedNetworkId: null,
        },
      })

      if (!(networkId in constants.networksById)) {
        showErrorMessage(`Unrecognized network`)
      }

      const { smartContractAddress } = constants.networksById[networkId]

      try {
        const contractABI = new web3.eth.Contract(abi, smartContractAddress)

        dispatch({
          type: "setState",
          payload: {
            connectedNetworkId: networkId,
            contractABI,
          },
        })
      } catch (error) {
        showErrorMessage(`Error initializing contract instance: ${error}`)
      }
    }

    const queryChainId = async () => {
      const networkId = await ethereum.request({
        method: "eth_chainId",
      })

      handleChainChanged(networkId)
    }

    queryChainId()

    ethereum.on("chainChanged", handleChainChanged)
  }, [dispatch])

  const handleClickSelectNetwork = async (
    { networkId }: { networkId: string },
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkId }],
      })
    } catch (error) {
      dispatch({
        type: "showNotification",
        payload: {
          message: String(error) ?? "Unknown error",
          type: "error",
        },
      })
    }
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
      {!connectedNetwork && (
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
        connectedNetwork &&
        (
          [
            {
              icon: "id-card-clip",
              label: "Connected Account",
              value: (
                <StyledText
                  as="a"
                  href={`${connectedNetwork.pubkeyBeaconchainURL}/address/${account}`}
                  target="_blank"
                  variant="link"
                >
                  <FormattedAddress address={account} />
                  &zwj;
                  <Icon
                    className="ml-1"
                    name="square-up-right"
                  />
                </StyledText>
              ),
            },
            {
              icon: "wallet",
              label: "Wallet Balance",
              value: `${balance} ${connectedNetwork.currency}`,
            },
            {
              icon: "file-contract",
              label: "Deposit Contract",
              value: (
                <StyledText
                  as="a"
                  href={connectedNetwork.smartContractURL}
                  target="_blank"
                  variant="link"
                >
                  <FormattedAddress
                    address={connectedNetwork.smartContractAddress}
                  />
                  &zwj;
                  <Icon
                    className="ml-1"
                    name="square-up-right"
                  />
                </StyledText>
              ),
            },
            {
              icon: "arrow-up-to-line",
              label: "Max Amount Per Tx",
              value: `${(constants.maximumValue * 32).toLocaleString()} ${connectedNetwork.currency}`,
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
