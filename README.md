# Muon Wallet

## Installation

Run the following command to install the package

```bash
npm install muon-wallet
```

Include the styles file in your project

For React applications :

```bash
import 'muon-wallet/src/index.css'
```

## Importing

Now you can import the following options

// Using Node.js `require()`
```bash
const { checkConnect, requestConnect, accounts, web3 } = require('muon-wallet')
```

// Using ES6 imports
```bash
import { checkConnect, requestConnect, accounts, web3 } from 'muon-wallet'
```

## Options

1. requestConnect()
Request connection to MetaMask wallet.
if the connection is successfull , the Muon Wallet Modal opens and shows your account address.
After that, you can access to accounts and web3 instances.

2. checkConnect()
Checks if the wallet is connected and opens the Muon Wallet Modal.
It also create accounts and web3 instances if they are not.

3. accounts
Returns the addresses of your accounts only if the wallet is connected

4. web3
Returns the instance of web3 from web3.js package only if the wallet is connected