import { AppHeader } from "./components/AppHeader"
import { BoxForLoadYourFile } from "./components/BoxForLoadYourFile"
import { BoxForNetworkDetails } from "./components/BoxForNetworkDetails"
import { BoxForTransaction } from "./components/BoxForTransaction"
import { BoxForTransactionDetails } from "./components/BoxForTransactionDetails"
import { AppFooter } from "./components/AppFooter"
import { LoadingScreen } from "./components/LoadingScreen"
import { ModalWindowForTerms } from "./components/ModalWindowForTerms"
import { Notifications } from "./components/Notifications"
import { SectionContainer } from "./components/SectionContainer"
import { Web3ModalProvider } from "./components/Web3ModalProvider"
import { AppContext } from "./context"
import { useReducerWithPersistedStateKeys } from "./hooks/useReducerWithPersistedStateKeys"
import { AppReducer, initialState } from "./reducer"

function App() {
  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initialState,
    localStorageKeyName: "saved-state",
    persistedKeys: [
      "connectedAccountAddress",
      "isTermsAgreed",
      "previouslyDepositedPubkeys",
    ],
    reducer: AppReducer,
  })

  return (
    <AppContext.Provider
      value={{
        dispatch,
        state,
      }}
    >
      <Web3ModalProvider>
        <LoadingScreen />

        <Notifications />

        <ModalWindowForTerms />

        <main className="space-y-6 pb-12">
          <AppHeader />

          <SectionContainer
            className="
              grid
              grid-cols-[2fr_1fr_1fr]
              items-stretch
              gap-6
            "
          >
            <BoxForNetworkDetails />

            <BoxForLoadYourFile />

            <BoxForTransaction />
          </SectionContainer>

          <SectionContainer>
            <BoxForTransactionDetails />
          </SectionContainer>
          <AppFooter />
        </main>
      </Web3ModalProvider>
    </AppContext.Provider>
  )
}

export default App
