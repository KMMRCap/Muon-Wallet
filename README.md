# Muon Wallet

## Installation

Run the following command to install the package

```bash
npm install muon-wallet
```

Include the styles file in your project

For React applications :

```bash
import 'muon-wallet/src/css/index.css'
```

## Getting Started

## Importing

Now you can import the "Muon" class

### Using Node.js `require()`

```bash
const { Muon } = require('muon-wallet')
```

### Using ES6 imports

```bash
import { Muon } from 'muon-wallet'
```

## Usage

The Muon class accepts an optional base url as string that will replace the package default base url.
Then you can call the request method of the constructed muon class.

```bash
const muon = new Muon()
muon.request()
```

The "request" method, accepts these required parameters :

1. appName :
   This parameter must be the name of one of apps that exist in the [Muon Explorer](https://explorer.muon.net) apps list and it should be string.

2. methodName :
   This parameter must be the name of one of method of the app that is entered as the first parameter.

3. params :
   This parameter must be the params of the method that is entered as the second parameter and it should be an object.

## Examples

This function returns a promise that should be handled correctly.

```bash
const muon = new Muon()
muon.request(app, method, params)
   .then(res => {
      console.log(res)
   })
   .catch(err => {
      console.error(err)
   })
```

```bash
try{
	const muon = new Muon()
   const res = await request(app, method, params)
   console.log(res)
}
catch(err){
   console.error(err)
}
```
