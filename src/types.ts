import { Dispatch } from "react"
import Contract from "web3-eth-contract"
import abi from "./abi.json"
import { constants } from "./constants"

export type AppAction =
  | {
      type: "setState"
      payload: Partial<AppState>
    }
  | {
      type: "showMessage"
      payload: {
        type: "error" | "confirmation"
        message: string
      }
    }

export interface AppContextObject {
  dispatch: Dispatch<AppAction>
  state: AppState
}

export interface AppState {
  account: string | null
  balance: string | null
  confirmationMessages: string[]
  connectedNetworkId: SupportedNetworkId | null
  contractABI: Contract<typeof abi> | null
  errorMessages: string[]
  isTermsAgreed: boolean
  processing: string | null
  pubkeys: {
    excluded: string[]
    included: string[]
  }
  sendContractData: string | null
  transactionResponse: string | null
  uploadedFileContents: string | null
  validatedDesposits: DepositObject[]
  web3: string | null
}

type OptionalDepositKeys = (typeof constants.optionalJSONKeys)[number]
type RequiredDepositKeys = (typeof constants.requiredJSONKeys)[number]

export type DepositObject = {
  [K in RequiredDepositKeys]: string | number
} & {
  [K in OptionalDepositKeys]?: string | number
}

export type SupportedNetworkId = keyof typeof constants.networksById
