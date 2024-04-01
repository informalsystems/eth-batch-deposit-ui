import { AppAction, AppState } from "./types"

const initialState: AppState = {
  account: null,
  balance: null,
  confirmationMessages: [],
  connectedNetworkId: null,
  contractABI: null,
  errorMessages: [],
  isTermsAgreed: false,
  processing: null,
  pubkeys: {
    excluded: [],
    included: [],
  },
  sendContractData: null,
  transactionResponse: null,
  uploadedFileContents: null,
  validatedDesposits: [],
  web3: null,
}

const AppReducer = (state: AppState, action: AppAction) => {
  let newState = state

  switch (action.type) {
    case "showMessage": {
      const { message, type } = action.payload

      const keyToUpdate = `${type}Messages` as const

      newState = {
        ...state,
        [keyToUpdate]: [...state[keyToUpdate], message],
      }
      break
    }

    case "setState": {
      newState = {
        ...state,
        ...action.payload,
      }
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
