import { MouseEvent } from "react"
import { useSwitchChain } from "wagmi"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { Box } from "./Box"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"

export const BoxForNetworkDetails = () => {
  const {
    state: {
      connectedAccountAddress,
      connectedAccountBalance,
      connectedNetworkId,
    },
  } = useAppContext()

  const { switchChain } = useSwitchChain()

  const isFullyConnected = !!connectedAccountAddress && !!connectedNetworkId

  const connectedNetwork =
    isFullyConnected && connectedNetworkId in constants.networksById
      ? constants.networksById[
          connectedNetworkId as keyof typeof constants.networksById
        ]
      : null

  const handleClickSelectNetwork = async (
    { networkId }: { networkId: number },
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    switchChain({ chainId: networkId })
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
                const idAsNumber = Number(id)

                const isActive = connectedNetworkId === idAsNumber

                return (
                  <li key={idAsNumber}>
                    <Button
                      iconName="hexagon"
                      isActive={isActive}
                      size="small"
                      onClick={handleClickSelectNetwork.bind(null, {
                        networkId: idAsNumber,
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
