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

Now you can import the "request" function

### Using Node.js `require()`
```bash
const { request } = require('muon-wallet')
```

### Using ES6 imports
```bash
import { request } from 'muon-wallet'
```

## Parameters

1. appName : 
This parameter must be the name of one of apps that exist in the [Muon Explorer](https://explorer.muon.net) apps list and it should be string.  

2. methodName :
This parameter must be the name of one of method of the app that is entered as the first parameter.

3. params :
This parameter must be the params of the method that is entered as the second parameter and it should be an object.

## Examples

This function returns a promise that should be handled correctly.

```bash
request(app,method,params)
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.error(err)
    })
```

```bash
try{
    const res = await request(app,method,params)
    console.log(res)
}
catch(err){
    console.error(err)
}
```