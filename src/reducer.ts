import { AppAction, AppState } from "./types"

const initialState: AppState = {
  account: null,
  balance: null,
  confirmationMessage: "",
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
