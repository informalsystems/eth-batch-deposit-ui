import update from "immutability-helper"
import { uniqueId } from "lodash"
import { AppAction, AppState } from "./types"

const initialState: AppState = {
  connectedAccountAddress: null,
  connectedAccountBalance: null,
  connectedNetworkId: null,
  isTermsAgreed: false,
  loadedFileContents: null,
  loadingMessage: null,
  notifications: [],
  previouslyDepositedPubkeys: [],
  validatedDeposits: [],
}

const AppReducer = (state: AppState, action: AppAction) => {
  let newState = state

  switch (action.type) {
    case "dismissNotifications": {
      const { notificationIds } = action.payload

      newState = update(newState, {
        notifications: {
          $set: newState.notifications.filter(
            ({ id }) => !notificationIds.includes(id),
          ),
        },
      })
      break
    }

    case "showNotification": {
      const { message, type } = action.payload

      const notificationId = uniqueId()

      newState = update(newState, {
        notifications: {
          $push: [
            {
              id: notificationId,
              message,
              type,
            },
          ],
        },
      })
      break
    }

    case "setState": {
      newState = update(newState, {
        $merge: action.payload,
      })
      break
    }

    default:
      break
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`AppAction:`, {
      action,
      previousState: state,
      newState,
    })
  }

  return newState
}

export { AppReducer, initialState }
