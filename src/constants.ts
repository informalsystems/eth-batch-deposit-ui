export const constants = {
  maximumValue: 50,
  networksById: {
    "0x1": {
      currency: "ETH",
      label: "Mainnet",
      pubkeyBeaconchainURL: "https://beaconcha.in",
      smartContractAddress: "0x39DC6a99209B5e6B81dC8540C86Ff10981ebDA29",
      smartContractURL: `https://etherscan.io/address/0x39DC6a99209B5e6B81dC8540C86Ff10981ebDA29`,
    },
    "0x4268": {
      currency: "holeskyETH",
      label: "Holesky",
      pubkeyBeaconchainURL: "https://holesky.beaconcha.in",
      smartContractAddress: "0xF78a36B46Ef0e40dc98780cEE56B1D295F68B0eF",
      smartContractURL:
        "https://holesky.etherscan.io/address/0x39DC6a99209B5e6B81dC8540C86Ff10981ebDA29",
    },
  },
  optionalJSONKeys: [
    "amount",
    "deposit_cli_version",
    "deposit_message_root",
    "fork_version",
  ],
  requiredJSONKeys: [
    "deposit_data_root",
    "network_name",
    "pubkey",
    "signature",
    "withdrawal_credentials",
  ],
} as const
