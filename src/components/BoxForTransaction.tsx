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

    // Prepare transaction parameters

    interface TransactionParameters {
      from: string
      to: string
      value: string | number
      gas: bigint
      data: string
    }

    let transactionParameters: TransactionParameters = {
      from: "",
      to: "",
      value: "0",
      gas: BigInt(0),
      data: "",
    }

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
      const contractABI = new web3.eth.Contract(abi, smartContractAddress)

      const totalAmount = validDeposits.reduce((acc, deposit) => {
        return acc + Number(deposit.amount)
      }, 0)

      const totalAmountInWei = web3.utils.toWei(
        (totalAmount / 1000000000).toString(),
        "ether",
      )

      const defaultGas: bigint = BigInt(constants.maxGas)
      transactionParameters = {
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

      // Check if all values are populated
      const areParametersPopulated = [
        transactionParameters.from,
        transactionParameters.to,
        transactionParameters.value,
        transactionParameters.gas,
        transactionParameters.data,
        allPubkeys,
        allWithdrawalCredentials,
        allSignatures,
        allDepositDataRoots,
      ].every((param) => param !== undefined && param !== null && param !== "")

      if (!areParametersPopulated) {
        throw new Error("Transaction parameters are not fully populated")
      }
    } catch (error) {
      setIsTransactionDetailsModalOpen(false)
      showErrorMessage(`Error preparing transaction parameters: ${error}`)
    }

    // Estimate max gas and adjust gas limit by 20%

    try {
      const gasEstimate = await web3.eth.estimateGas(transactionParameters)
      transactionParameters.gas = (gasEstimate * BigInt(12)) / BigInt(10)
    } catch (error) {
      setIsTransactionDetailsModalOpen(false)
      showErrorMessage(`Error estimating gas: ${error}`)
    }

    // Send transaction

    try {
      dispatch({
        type: "setState",
        payload: {
          loadingMessage: "Processing Transaction...",
        },
      })

      const response = await web3.eth.sendTransaction(transactionParameters)

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
          loadingMessage: null,
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
      showErrorMessage(`Error executing transaction: ${error}`)
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
          <>
            <span className="font-bold">
              Please make sure you have control of both addresses listed below:
            </span>
            <a
              href={`${connectedNetwork.pubkeyBeaconchainURL}/address/${connectedAccountAddress}`}
              target="_blank"
              className="transition duration-300 hover:opacity-50"
            >
              Connected Account: <b>{connectedAccountAddress?.toLowerCase()}</b>
            </a>
            <a
              href={`${connectedNetwork.pubkeyBeaconchainURL}/address/${withdrawalCredentials}`}
              target="_blank"
              className="transition duration-300 hover:opacity-50"
            >
              Withdrawal Credentials: <b>{withdrawalCredentials}</b>
            </a>
          </>
          <span className="font-bold">All set?</span>
          <span className="text-xs">
            Please ensure you have control of withdrawal credentials for each
            validator.
          </span>
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
