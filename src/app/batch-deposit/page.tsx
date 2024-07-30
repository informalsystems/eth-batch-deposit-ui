'use client'

import { AppFooter } from '@/components/AppFooter'
import { AppHeader } from '@/components/AppHeader'
import { BoxForLoadYourFile } from '@/components/BoxForLoadYourFile'
import { BoxForNetworkDetails } from '@/components/BoxForNetworkDetails'
import { BoxForTransaction } from '@/components/BoxForTransaction'
import { BoxForTransactionDetails } from '@/components/BoxForTransactionDetails'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ModalWindowForTerms } from '@/components/ModalWindowForTerms'
import { Notifications } from '@/components/Notifications'
import { SectionContainer } from '@/components/SectionContainer'
import { config, Web3ModalProvider } from '@/components/Web3ModalProvider'
import { useReducerWithPersistedStateKeys } from '@/lib/useReducerWithPersistedStateKeys'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { AppContext } from './context'
import { AppReducer, initialState } from './reducer'

function App() {
  const [state, dispatch] = useReducerWithPersistedStateKeys({
    initialState,
    localStorageKeyName: 'saved-state',
    persistedKeys: [
      'connectedAccountAddress',
      'isTermsAgreed',
      'previouslyDepositedPubkeys',
    ],
    reducer: AppReducer,
  })

  const initialWeb3ModalState = cookieToInitialState(
    config,
    headers().get('cookie'),
  )

  return (
    <AppContext.Provider
      value={{
        dispatch,
        state,
      }}
    >
      <Web3ModalProvider initialState={initialWeb3ModalState}>
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
