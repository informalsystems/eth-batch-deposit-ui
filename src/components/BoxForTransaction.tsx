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
  const [isIdentityVerificationModalOpen, setIsIdentityVerificationModalOpen] =
    useState(false)

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

  const canSendTransaction = validDeposits.length === validatedDeposits.length

  const showErrorMessage = (message: string) =>
    dispatch({
      type: "showNotification",
      payload: {
        type: "error",
        message,
      },
    })

  const handleClickVerifyIdentity = async (event: MouseEvent) => {
    event.preventDefault()

    if (!connectedAccountAddress) {
      return
    }

    const web3 = new Web3(connectorClient.data)

    const sig = await web3.eth.personal.sign(
      "Verify your address",
      connectedAccountAddress,
      "",
    )

    const result = web3.eth.accounts
      .recover("Verify your address", sig)
      .toLowerCase()

    if (result === connectedAccountAddress.toLowerCase()) {
      setIsIdentityVerificationModalOpen(false)
      setIsTransactionDetailsModalOpen(true)
    } else {
      console.error(
        "Account verification failed! ",
        result,
        connectedAccountAddress,
      )
      const showErrorMessage = (message: string) =>
        dispatch({
          type: "showNotification",
          payload: {
            type: "error",
            message,
          },
        })
      setIsIdentityVerificationModalOpen(false)
      showErrorMessage("Account verification failed!")
    }
  }

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
        const transactionParameters = {
          from: connectedAccountAddress!,
          to: smartContractAddress,
          value: totalAmountInWei,
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
          dispatch({
            type: "setState",
            payload: {
              loadingMessage: "Processing Transaction...",
            },
          })

          const response = await web3.eth.sendTransaction(transactionParameters)

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
              previouslyDepositedPubkeys: [
                ...previouslyDepositedPubkeys,
                ...allPubkeys,
              ],
            },
          })
        } catch (error) {
          showErrorMessage(`Error executing transaction: ${error}`)
        }
      } catch (error) {
        showErrorMessage(`Error encoding ABI: ${error}`)
      }
    } catch (error) {
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
          onClick={() => setIsIdentityVerificationModalOpen(true)}
        >
          Sign Transaction
        </Button>

        <ModalWindow
          isOpen={isIdentityVerificationModalOpen}
          onClose={() => setIsIdentityVerificationModalOpen(false)}
        >
          Click below to verify your identity:
          <Button onClick={handleClickVerifyIdentity}>Verify Identity</Button>
        </ModalWindow>

        <ModalWindow
          isOpen={isTransactionDetailsModalOpen}
          onClose={() => setIsTransactionDetailsModalOpen(false)}
        >
          All set?
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
