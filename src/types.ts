import { Dispatch } from "react"
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
  connectedAccountAddress: string | null
  connectedAccountBalance: string | null
  connectedNetworkId: SupportedNetworkId | null
  isTermsAgreed: boolean
  isLoading: boolean
  loadedFileContents: string | null
  notifications: AppNotification[]
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
