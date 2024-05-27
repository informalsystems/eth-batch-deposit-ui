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
  connectedNetworkId: number | null
  isTermsAgreed: boolean
  loadedFileContents: string | null
  loadingMessage: string | null
  notifications: AppNotification[]
  previouslyDepositedPubkeys: string[]
  validatedDeposits: ValidatedDepositObject[]
}

type OptionalDepositKeys = (typeof constants.optionalJSONKeys)[number]
type RequiredDepositKeys = (typeof constants.requiredJSONKeys)[number]

export type DepositObject = {
  [K in RequiredDepositKeys]: string | number
} & {
  [K in OptionalDepositKeys]?: string | number
}

export type ValidatedDepositObject = Partial<DepositObject> & {
  validationErrors: string[]
}
