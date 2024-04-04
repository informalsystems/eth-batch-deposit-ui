import { AppHeader } from "./components/AppHeader"
import { BoxForNetworkDetails } from "./components/BoxForNetworkDetails"
import { BoxForTransaction } from "./components/BoxForTransaction"
import { BoxForTransactionDetails } from "./components/BoxForTransactionDetails"
import { BoxForUploadYourFile } from "./components/BoxForUploadYourFile"
import { ModalWindowForTerms } from "./components/ModalWindowForTerms"
import { Notifications } from "./components/Notifications"
import { SectionContainer } from "./components/SectionContainer"
import { AppContext } from "./context"
import { useReducerWithPersistedStateKeys } from "./hooks/useReducerWithPersistedStateKeys"
import { AppReducer, initialState } from "./reducer"

function App() {
  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initialState,
    localStorageKeyName: "saved-state",
    persistedKeys: ["account", "isTermsAgreed"],
    reducer: AppReducer,
  })

  return (
    <AppContext.Provider
      value={{
        dispatch,
        state,
      }}
    >
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

          <BoxForUploadYourFile />

          <BoxForTransaction />
        </SectionContainer>

        <SectionContainer>
          <BoxForTransactionDetails />
        </SectionContainer>
      </main>
    </AppContext.Provider>
  )
}

export default App
