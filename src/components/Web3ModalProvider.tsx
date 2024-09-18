import { createWeb3Modal } from "@web3modal/wagmi/react"

import { WagmiProvider, createConfig, http } from "wagmi"
import { holesky, mainnet } from "wagmi/chains"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { injected, walletConnect } from "wagmi/connectors"

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "87af3006d417f58b484b0544e736aa59"

// 2. Create wagmiConfig
const metadata = {
  name: "Batch Deposit Ethereum Validators",
  description: "Powered by Informal Systems",
  url: "https://eth.informal.systems/batch-deposit",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

const config = createConfig({
  chains: [holesky, mainnet],
  transports: {
    [holesky.id]: http("https://ethereum-holesky-rpc.publicnode.com", {
      timeout: 20_000,
    }),
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com", {
      timeout: 20_000,
    }),
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  metadata,
  enableAnalytics: true,
  enableOnramp: false,
})

export const Web3ModalProvider = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </WagmiProvider>
)
