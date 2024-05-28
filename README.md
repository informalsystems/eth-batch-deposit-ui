# Ethereum Validator Batch Deposit UI

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v4.5.4-blue)
![Node](https://img.shields.io/badge/Node-v14.17.0-green)
![React](https://img.shields.io/badge/React-v18.0.0-blue)
![Vite](https://img.shields.io/badge/Vite-v2.9.9-yellow)

## Overview

This project is a TypeScript-based web application designed for batch depositing Ethereum 2.0 validators. The application provides a user-friendly interface for submitting multiple validator deposits efficiently.

## Features

- **Batch Deposits:** Submit multiple Ethereum validator deposits in a single operation.
- **Data Validation:** Ensure deposit data is accurate and complete before submission.
- **Blockchain Integration:** Interact with the Ethereum blockchain using Web3.js.
- **Intuitive UI:** Built with React for a responsive and easy-to-use interface.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.17.0 or later)
- [npm](https://www.npmjs.com/) (v6.14.13 or later)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/informalsystems/eth-batch-deposit-ui.git
   cd eth-batch-deposit-ui
   npm install
   npm run build
   ```

2. **Running the Application**

   ```bash
   npm run dev
   ```

### Usage

- Upload Deposit Data:
  Prepare your deposit data file (e.g., JSON or CSV format).
  Upload the file using the web interface.

- Validate Deposit Data:
  The application will check the data for completeness and correctness.

- Submit Deposits:
  Review the batch summary.
  Confirm and submit the batch deposit to the Ethereum network.

<hr>

### License

Copyright 2024 Informal Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
