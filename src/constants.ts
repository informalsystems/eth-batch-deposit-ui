export const constants = {
  maximumDepositsPerFile: 100,
  networksById: {
    "0x1": {
      currency: "ETH",
      depositCliVersion: "2.7.0",
      forkVersion: "00000000",
      label: "Mainnet",
      pubkeyBeaconchainURL: "https://beaconcha.in",
      smartContractAddress: "0x39DC6a99209B5e6B81dC8540C86Ff10981ebDA29",
      smartContractURL: `https://etherscan.io/address/0x39DC6a99209B5e6B81dC8540C86Ff10981ebDA29`,
      validationURL: "https://beaconcha.in/api/v1/validator",
    },
    "0x4268": {
      currency: "holeskyETH",
      depositCliVersion: "2.7.0",
      forkVersion: "01017000",
      label: "Holesky",
      pubkeyBeaconchainURL: "https://holesky.beaconcha.in",
      smartContractAddress: "0xF78a36B46Ef0e40dc98780cEE56B1D295F68B0eF",
      smartContractURL:
        "https://holesky.etherscan.io/address/0xF78a36B46Ef0e40dc98780cEE56B1D295F68B0eF",
      validationURL: "https://holesky.beaconcha.in/api/v1/validator",
    },
  },
  optionalJSONKeys: [],
  requiredDepositAmount: 32000000000,
  requiredJSONKeys: [
    "amount",
    "deposit_cli_version",
    "deposit_data_root",
    "deposit_message_root",
    "fork_version",
    "network_name",
    "pubkey",
    "signature",
    "withdrawal_credentials",
  ],
} as const
