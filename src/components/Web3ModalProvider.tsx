'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { ReactNode } from 'react'
import { cookieStorage, createStorage, State, WagmiProvider } from 'wagmi'
import { holesky, mainnet } from 'wagmi/chains'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'cdaafaceba85040db868057372657db2'

// 2. Create wagmiConfig
const metadata = {
  name: 'Batch Deposit Ethereum Validators',
  description: 'Powered by Informal Systems',
  url: 'https://eth.informal.systems', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

export const config = defaultWagmiConfig({
  chains: [holesky, mainnet],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: false,
})

export function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider
      config={config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
