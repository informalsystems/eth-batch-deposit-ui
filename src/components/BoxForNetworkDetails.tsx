import { MouseEvent, useEffect } from "react"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { SupportedNetworkId } from "../types"
import { Box } from "./Box"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ethereum = (window as any).ethereum

export const BoxForNetworkDetails = () => {
  const {
    dispatch,
    state: {
      connectedAccountAddress,
      connectedAccountBalance,
      connectedNetworkId,
    },
  } = useAppContext()

  const isFullyConnected = !!connectedAccountAddress && !!connectedNetworkId

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
      // Wipe out any state that was based on the network
      dispatch({
        type: "setState",
        payload: {
          notifications: [],
          connectedNetworkId: networkId,
        },
      })

      if (!(networkId in constants.networksById)) {
        showErrorMessage(`Unrecognized network`)
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
        <Box
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
        </Box>
      )}
    >
      {!connectedNetwork && (
        <Box
          className="
            h-full
            text-fadedTextColor
          "
          variant="centered-row"
        >
          Not Connected
        </Box>
      )}
      {isFullyConnected &&
        connectedNetwork &&
        (
          [
            {
              icon: "id-card-clip",
              label: "Connected Account",
              value: (
                <Box
                  as="a"
                  href={`${connectedNetwork.pubkeyBeaconchainURL}/address/${connectedAccountAddress}`}
                  target="_blank"
                  variant="link"
                >
                  <FormattedAddress address={connectedAccountAddress} />
                  &zwj;
                  <Icon
                    className="ml-1"
                    name="square-up-right"
                  />
                </Box>
              ),
            },
            {
              icon: "wallet",
              label: "Wallet Balance",
              value: `${connectedAccountBalance} ${connectedNetwork.currency}`,
            },
            {
              icon: "file-contract",
              label: "Deposit Contract",
              value: (
                <Box
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
                </Box>
              ),
            },
            {
              icon: "arrow-up-to-line",
              label: "Max Amount Per Tx",
              value: `${(constants.maximumDepositsPerFile * 32).toLocaleString()} ${connectedNetwork.currency}`,
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
              <Box variant="label">{label}</Box>
              <Box variant="accentuated">{value}</Box>
            </div>
          </div>
        ))}
    </LabeledBox>
  )
}
