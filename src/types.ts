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
      type: "dismissNotifications"
      payload: {
        notificationIds: AppNotification["id"][]
      }
    }
  | {
      type: "showNotification"
      payload: {
        type: "error" | "confirmation"
        message: string
      }
    }

export interface AppContextObject {
  dispatch: Dispatch<AppAction>
  state: AppState
}

export interface AppNotification {
  id: string | number
  type: "confirmation" | "error"
  message: string
}

export interface AppState {
  account: string | null
  balance: string | null
  connectedNetworkId: SupportedNetworkId | null
  contractABI: Contract<typeof abi> | null
  isTermsAgreed: boolean
  isLoading: boolean
  notifications: AppNotification[]
  sendContractData: string | null
  transactionResponse: string | null
  uploadedFileContents: string | null
  validatedDeposits: Partial<DepositObject>[]
}

type OptionalDepositKeys = (typeof constants.optionalJSONKeys)[number]
type RequiredDepositKeys = (typeof constants.requiredJSONKeys)[number]

export type DepositObject = {
  [K in RequiredDepositKeys]: string | number
} & {
  [K in OptionalDepositKeys]?: string | number
} & {
  validationErrors?: string[]
}

export type SupportedNetworkId = keyof typeof constants.networksById
