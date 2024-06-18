import { MouseEvent, useState } from "react"
import { twJoin } from "tailwind-merge"
import { useConnectorClient } from "wagmi"
import { TransactionReceipt, Web3 } from "web3"
import abi from "../abi.json"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { cleanHex } from "../functions/cleanHex"
import { formatHex } from "../functions/formatHex"
import { Box } from "./Box"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { ModalWindow } from "./ModalWindow"

export const BoxForTransaction = () => {
  const [isTransactionDetailsModalOpen, setIsTransactionDetailsModalOpen] =
    useState(false)

  const [isTransactionResultModalOpen, setIsTransactionResultModalOpen] =
    useState(false)

  const [transactionResult, setTransactionResult] =
    useState<Partial<TransactionReceipt> | null>(null)

  const connectorClient = useConnectorClient()

  const {
    dispatch,
    state: {
      connectedAccountAddress,
      connectedNetworkId,
      previouslyDepositedPubkeys,
      validatedDeposits,
      withdrawalCredentials,
    },
  } = useAppContext()

  if (!connectedNetworkId) {
    return
  }

  const connectedNetwork =
    constants.networksById[
      connectedNetworkId as keyof typeof constants.networksById
    ]

  const validDeposits = validatedDeposits.filter(
    (deposit) => deposit.validationErrors?.length === 0,
  )

  const canSendTransaction =
    validDeposits.length === validatedDeposits.length &&
    validatedDeposits.length !== 0

  const showErrorMessage = (message: string) =>
    dispatch({
      type: "showNotification",
      payload: {
        type: "error",
        message,
      },
    })

  const handleClickExecuteTransaction = async (event: MouseEvent) => {
    event.preventDefault()

    if (!connectedNetworkId) {
      return
    }

    const web3 = new Web3(connectorClient.data)

    const { smartContractAddress } =
      constants.networksById[
        connectedNetworkId as keyof typeof constants.networksById
      ]

    try {
      const contractABI = new web3.eth.Contract(abi, smartContractAddress)

      const totalAmount = validDeposits.reduce((acc, deposit) => {
        return acc + Number(deposit.amount)
      }, 0)

      const totalAmountInWei = web3.utils.toWei(
        (totalAmount / 1000000000).toString(),
        "ether",
      )

      const {
        allPubkeys,
        allWithdrawalCredentials,
        allSignatures,
        allDepositDataRoots,
      } = validDeposits.reduce<{
        allPubkeys: string[]
        allWithdrawalCredentials: string[]
        allSignatures: string[]
        allDepositDataRoots: string[]
      }>(
        (acc, deposit) => {
          return {
            allPubkeys: [...acc.allPubkeys, formatHex(deposit.pubkey!, 96)],
            allWithdrawalCredentials: [
              ...acc.allWithdrawalCredentials,
              formatHex(deposit.withdrawal_credentials!, 96),
            ],
            allSignatures: [
              ...acc.allSignatures,
              formatHex(deposit.signature!, 192),
            ],
            allDepositDataRoots: [
              ...acc.allDepositDataRoots,
              formatHex(deposit.deposit_data_root!, 64),
            ],
          }
        },
        {
          allPubkeys: [],
          allWithdrawalCredentials: [],
          allSignatures: [],
          allDepositDataRoots: [],
        },
      )

      try {
        const defaultGas: bigint = BigInt(100000)
        const transactionParameters = {
          from: connectedAccountAddress!,
          to: smartContractAddress,
          value: totalAmountInWei,
          gas: defaultGas,
          data: contractABI.methods
            .batchDeposit(
              allPubkeys,
              allWithdrawalCredentials,
              allSignatures,
              allDepositDataRoots,
            )
            .encodeABI(),
        }

        try {
          await web3.eth
            .estimateGas(transactionParameters)
            .then(function (gasEstimate) {
              transactionParameters.gas = gasEstimate
            })

          try {
            dispatch({
              type: "setState",
              payload: {
                loadingMessage: "Processing Transaction...",
              },
            })

            const response = await web3.eth.sendTransaction(
              transactionParameters,
            )

            dispatch({
              type: "setState",
              payload: {
                loadingMessage: null,
              },
            })

            setIsTransactionDetailsModalOpen(false)
            setIsTransactionResultModalOpen(true)
            setTransactionResult({
              blockHash: cleanHex(`${response.blockHash}`, 66),
              blockNumber: `${response.blockNumber}`.replace(/[^0-9]/g, ""),
              transactionHash: cleanHex(`${response.transactionHash}`, 66),
            })
            dispatch({
              type: "setState",
              payload: {
                loadedFileContents: null,
                validatedDeposits: [],
                previouslyDepositedPubkeys: [
                  ...previouslyDepositedPubkeys,
                  ...allPubkeys,
                ],
              },
            })
          } catch (error) {
            dispatch({
              type: "setState",
              payload: {
                loadingMessage: null,
              },
            })
            setIsTransactionDetailsModalOpen(false)
            const serializedError = JSON.stringify(error)
            const deserializedError = JSON.parse(serializedError)
            console.log("send tx test:", deserializedError)
            console.log(error)
            if (deserializedError !== null) {
              if (deserializedError.cause.data.message) {
                showErrorMessage(
                  `Error executing transaction 0: ${deserializedError.cause.data.message}`,
                )
              } else if (deserializedError.message) {
                showErrorMessage(
                  `Error executing transaction 1: ${deserializedError.message}`,
                )
              } else {
                showErrorMessage(`Error executing transaction 2: ${error}`)
              }
            }
          }
        } catch (error) {
          setIsTransactionDetailsModalOpen(false)
          const serializedError = JSON.stringify(error)
          const deserializedError = JSON.parse(serializedError)
          console.log(error)
          if (deserializedError !== null) {
            if (deserializedError.cause.data.message) {
              showErrorMessage(
                `Estimate gas error 0: ${deserializedError.cause.data.message}`,
              )
            } else if (deserializedError.message) {
              showErrorMessage(
                `Estimate gas error 1: ${deserializedError.message}`,
              )
            } else {
              showErrorMessage(`Estimate gas error 3: ${error}`)
            }
          }
        }
      } catch (error) {
        setIsTransactionDetailsModalOpen(false)
        showErrorMessage(`Error encoding ABI: ${error}`)
      }
    } catch (error) {
      setIsTransactionDetailsModalOpen(false)
      showErrorMessage(`Error initializing contract instance: ${error}`)
    }
  }

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
      <Box
        className="
          w-full
          gap-6
        "
        variant="centered-column"
      >
        <Icon
          className="text-8xl text-brandColor/50"
          name="file-signature"
          variant="thin"
        />

        <Button
          disabled={!canSendTransaction}
          variant="primary"
          onClick={() => setIsTransactionDetailsModalOpen(true)}
        >
          Sign Transaction
        </Button>

        <ModalWindow
          isOpen={isTransactionDetailsModalOpen}
          onClose={() => setIsTransactionDetailsModalOpen(false)}
        >
          {connectedAccountAddress !== withdrawalCredentials && (
            <>
              <span className="font-bold">
                Please make sure you have control of both addresses listed
                below:
              </span>
              <a
                href={`${connectedNetwork.pubkeyBeaconchainURL}/address/${connectedAccountAddress}`}
                target="_blank"
                className="transition duration-300 hover:opacity-50"
              >
                Connected Account: {connectedAccountAddress}
              </a>
              <a
                href={`${connectedNetwork.pubkeyBeaconchainURL}/address/${withdrawalCredentials}`}
                target="_blank"
                className="transition duration-300 hover:opacity-50"
              >
                Withdrawal Credentials: {withdrawalCredentials}
              </a>
            </>
          )}
          <span className="font-bold">All set?</span>
          <Button onClick={handleClickExecuteTransaction}>
            Execute Transaction
          </Button>
        </ModalWindow>

        <ModalWindow
          isOpen={isTransactionResultModalOpen}
          onClose={() => setIsTransactionResultModalOpen(false)}
        >
          <Box
            as="h2"
            variant="heading2"
          >
            Transaction Complete
          </Box>
          {(
            [
              [
                "Transaction Hash",
                <Box
                  as="a"
                  href={`${connectedNetwork.pubkeyBeaconchainURL}/tx/${transactionResult?.transactionHash}`}
                  target="_blank"
                  variant="link"
                >
                  <FormattedAddress
                    address={`${transactionResult?.transactionHash}`}
                  />
                  &zwj;
                  <Icon
                    className="ml-1"
                    name="square-up-right"
                  />
                </Box>,
              ],
              [
                "Block Hash",
                <Box
                  as="a"
                  href={`${connectedNetwork.pubkeyBeaconchainURL}/block/${transactionResult?.blockHash}`}
                  target="_blank"
                  variant="link"
                >
                  <FormattedAddress
                    address={`${transactionResult?.blockHash}`}
                  />
                  &zwj;
                  <Icon
                    className="ml-1"
                    name="square-up-right"
                  />
                </Box>,
              ],
              [
                "Block Number",
                <Box
                  as="a"
                  href={`${connectedNetwork.pubkeyBeaconchainURL}/block/${transactionResult?.blockNumber}`}
                  target="_blank"
                  variant="link"
                >
                  {`${transactionResult?.blockNumber}`}&zwj;
                  <Icon
                    className="ml-1"
                    name="square-up-right"
                  />
                </Box>,
              ],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <Box
                className="font-bold !text-white"
                variant="label"
              >
                {label}
              </Box>
              <div className="break-words">{value}</div>
            </div>
          ))}
        </ModalWindow>
      </Box>
    </LabeledBox>
  )
}
