const detectEthereumProvider = require('@metamask/detect-provider')
const { utils, Web3 } = require('web3')
const { Contracts } = require('./utils/contracts')
const Apps = require('./utils/Apps.json')

const checkProvider = (provider) => {
    if (provider !== window.ethereum) {
        throw 'Do you have multiple wallets installed?'
    }
}

const detectProvider = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
        checkProvider(provider)
        return provider
    }
    else {
        throw 'Please install MetaMask!'
    }
}

const checkWalletConnection = () => {
    if (window?.ethereum?._state.isConnected && window?.ethereum?._state.accounts?.length) {
        return
    }
    else {
        throw 'Wallet is not connected'
    }
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @returns {Promise<string>} Returns account address
 */

const getSelectedAccount = async (web3) => {
    const accounts = await web3.eth.getAccounts()
    return accounts[0]
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @returns {Promise<number>} Returns wallet muon balance
 */

const getWalletMuonBalance = async (web3, account) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.Token,
        Contracts.address.Token
    )
    const res = await contract.methods
        .balanceOf(account)
        .call()
    const balance = utils.fromWei(res, 'ether')
    return balance
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @returns {Promise<number>} Returns deposited muon balance
 */

const getDepositedMuonBalance = async (web3, account) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.MuonFeeUpgradeable,
        Contracts.address.MuonFeeUpgradeable
    )
    const res = await contract.methods
        .users(account)
        .call()
    const balance = utils.fromWei(res, 'ether')
    return balance
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @param {string} address The selected token contract address string
 * @returns {Promise<number>} Returns selected token wallet balance
 */

const getSelectedTokenBalance = async (web3, account, address) => {
    if (address === '0x0') {
        const res = await web3.eth.getBalance(account)
        const balance = utils.fromWei(res, 'ether')
        return balance
    }
    else {
        const contract = new web3.eth.Contract(
            Contracts.abi.Token,
            address
        )
        const res = await contract.methods
            .balanceOf(account)
            .call()
        const balance = utils.fromWei(res, 'ether')
        return balance
    }
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {object} token The selected token object
 * @returns {Promise<object>} Returns rates for selected token and destination token (MUON/ALICE/PION)
 */

const getPairExchangeRates = async (web3, token) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.Pair,
        token.pair
    )
    const res = await contract.methods
        .getReserves()
        .call()
    const rate1 = utils.fromWei(res._reserve0, 'ether')
    const rate2 = utils.fromWei(res._reserve1, 'ether')
    return { rate1, rate2 }
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} valueToPay The amount to swap
 * @param {string} account The account address string
 * @param {string} address Then token contract address string
 * @returns {Promise<any>} Returns swap response
 */

const buyMuon = async (web3, valueToPay, account, address) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.SmartRouter,
        Contracts.address.SmartRouter
    )
    const amountIn = valueToPay * (10 ** 18)
    const amountOutMin = 0
    const path = ['0xae13d989dac2f0debff460ac112a837c89baa7cd', '0x84102df4b6bcb72114532241894b2077428a7f86']
    const res = await contract.methods
        .swapExactTokensForTokens(amountIn, amountOutMin, path, account)
        .send({ from: account, value: address !== '0x0' ? 0 : amountIn })
    return res
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @returns {Promise<number>} Returns allowance
 */

const checkAllowance = async (web3, account) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.Token,
        Contracts.address.Token
    )
    const spender = Contracts.address.MuonFeeUpgradeable
    const res = await contract.methods
        .allowance(account, spender)
        .call()
    const allowance = utils.fromWei(res, 'ether')
    return allowance
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} amount The amount to deposit
 * @param {string} account The account address string
 * @returns {Promise<any>} Returns deposit response
 */

const approveDeposit = async (web3, amount, account) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.Token,
        Contracts.address.Token
    )
    const spender = Contracts.address.MuonFeeUpgradeable
    const convertedAmount = amount * (10 ** 18)
    const res = await contract.methods
        .approve(spender, convertedAmount)
        .send({ from: account })
    return res
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} amount The amount to deposit
 * @param {string} account The account address string
 * @returns {Promise<any>} Returns deposit response
 */

const depositMuon = async (web3, amount, account) => {
    const contract = new web3.eth.Contract(
        Contracts.abi.MuonFeeUpgradeable,
        Contracts.address.MuonFeeUpgradeable
    )
    const convertedAmount = utils.toWei(amount, 'ether')
    const res = await contract.methods
        .deposit(convertedAmount)
        .send({ from: account })
    return res
}


/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @param {string} app The app name
 * @param {string} method The method name
 * @param {string} params The stringified params object
 * @returns {Promise<any>} Returns swap response
 */

const approve = async (web3, account, app, method, params) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const appId = Apps.find(i => i.name === app).id
    const hash = utils.soliditySha3(
        { type: "address", value: account },
        { type: "uint64", value: timestamp },
        { type: "uint256", value: appId }
    )
    const res = await web3.eth.personal.sign(hash, account, 'Test Password')

    const paramsObject = JSON.parse(params)
    let paramsToConcat = ''
    Object.entries(paramsObject).forEach(item => {
        paramsToConcat = paramsToConcat.concat(`&params[${item[0]}]=${item[1]}`)
    })

    const url = `http://104.131.177.195:8080/v1/?app=${app}&method=${method}${paramsToConcat}&fee[spender]=${account}&fee[timestamp]=${timestamp}&fee[signature]=${res.signature}`;

    const data = await fetch(url, { method: 'GET' })
    return data
}


module.exports = {
    detectProvider,
    checkWalletConnection,
    getSelectedAccount,
    getWalletMuonBalance,
    getDepositedMuonBalance,
    getSelectedTokenBalance,
    getPairExchangeRates,
    buyMuon,
    checkAllowance,
    approveDeposit,
    depositMuon,
    approve,
}