import { MouseEvent, useState } from "react"
import { twJoin } from "tailwind-merge"
import { TransactionReceipt, Web3 } from "web3"
import abi from "../abi.json"
import { constants } from "../constants"
import { useAppContext } from "../context"
import { formatHex } from "../functions/formatHex"
import { Box } from "./Box"
import { Button } from "./Button"
import { FormattedAddress } from "./FormattedAddress"
import { Icon } from "./Icon"
import { LabeledBox } from "./LabeledBox"
import { ModalWindow } from "./ModalWindow"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ethereum = (window as any).ethereum

export const BoxForTransaction = () => {
  const [isIdentityVerificationModalOpen, setIsIdentityVerificationModalOpen] =
    useState(false)

  const [isTransactionDetailsModalOpen, setIsTransactionDetailsModalOpen] =
    useState(false)

  const [isTransactionResultModalOpen, setIsTransactionResultModalOpen] =
    useState(false)

  const [transactionResult, setTransactionResult] =
    useState<Partial<TransactionReceipt> | null>(null)

  const {
    dispatch,
    state: { connectedAccountAddress, connectedNetworkId, validatedDeposits },
  } = useAppContext()

  if (!connectedNetworkId) {
    return
  }

  const connectedNetwork = constants.networksById[connectedNetworkId]

  const validDeposits = validatedDeposits.filter(
    (deposit) => deposit.validationErrors?.length === 0,
  )

  const canSendTransaction = validDeposits.length >= 1

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

    const web3 = new Web3(ethereum)

    const sig = await web3.eth.personal.sign(
      "Verify your address",
      connectedAccountAddress,
      "",
    )

    const result = web3.eth.accounts
      .recover("Verify your address", sig)
      .toLowerCase()

    if (result === connectedAccountAddress) {
      setIsIdentityVerificationModalOpen(false)
      setIsTransactionDetailsModalOpen(true)
    }
  }

  const handleClickExecuteTransaction = async (event: MouseEvent) => {
    event.preventDefault()

    if (!connectedNetworkId) {
      return
    }

    const web3 = new Web3(ethereum)

    const { smartContractAddress } = constants.networksById[connectedNetworkId]

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
            allPubkeys: [...acc.allPubkeys, formatHex(deposit.pubkey!)],
            allWithdrawalCredentials: [
              ...acc.allWithdrawalCredentials,
              formatHex(deposit.withdrawal_credentials!),
            ],
            allSignatures: [
              ...acc.allSignatures,
              formatHex(deposit.signature!),
            ],
            allDepositDataRoots: [
              ...acc.allDepositDataRoots,
              formatHex(deposit.deposit_data_root!),
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

        console.log({ transactionParameters })

        try {
          const response = await web3.eth.sendTransaction(transactionParameters)

          setIsTransactionDetailsModalOpen(false)
          setIsTransactionResultModalOpen(true)
          setTransactionResult(response)
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
