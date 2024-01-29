const detectEthereumProvider = require('@metamask/detect-provider')
const { utils, Web3 } = require('web3')
const { Contracts } = require('./contracts')
const Apps = require('./data/Apps.json')

// ==========================================================================
// REQUIRED CHECKS TO OPEN MODAL
// ==========================================================================

const checkProvider = (provider) => {
	if (provider !== window.ethereum) {
		throw 'Do you have multiple wallets installed?'
	}
}

const detectProvider = async () => {
	const provider = await detectEthereumProvider()

	if (provider) {
		checkProvider(provider)
		return provider
	} else {
		throw 'Please install MetaMask!'
	}
}

const checkWalletConnection = () => {
	if (window?.ethereum?._state.isConnected && window?.ethereum?._state.accounts?.length) {
		return
	} else {
		throw 'Wallet is not connected'
	}
}

const checkActiveChainId = async (web3) => {
	const chainId = await web3.eth.getChainId()
	if (utils.toNumber(chainId) !== 97) {
		throw 'Please switch to bsc testnet (BNB Smart Chain Testnet)'
	}
}

const handleAccountChange = async (close) => {
	close(null, 'Account changed during request')
}
const handleChainChange = async (close) => {
	close(null, 'Chain changed during request')
}

const detectAccountAndChainChange = (close) => {
	window.ethereum.on('accountsChanged', () => handleAccountChange(close))
	window.ethereum.on('chainChanged', () => handleChainChange(close))
}

const removeEventListeners = (close) => {
	window.ethereum.removeListener('accountsChanged', () => handleAccountChange(close))
	window.ethereum.removeListener('chainChanged', () => handleChainChange(close))
}

// ==========================================================================
// GENERAL
// ==========================================================================

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

const getWalletBalance = async (web3, account) => {
	const contract = new web3.eth.Contract(Contracts.abi.Token, Contracts.address.Token)
	const res = await contract.methods.balanceOf(account).call()
	const balance = utils.fromWei(res, 'ether')
	return balance
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @returns {Promise<number>} Returns deposited muon balance
 */

const getDepositBalance = async (web3, account) => {
	const contract = new web3.eth.Contract(
		Contracts.abi.MuonFeeUpgradeable,
		Contracts.address.MuonFeeUpgradeable
	)
	const res = await contract.methods.users(account).call()
	const balance = utils.fromWei(res, 'ether')
	return balance
}

/**
 * @param {string} account The account address string
 * @returns {Promise<number>} Returns deposited muon balance
 */

const getUsedDepositedBalance = async (account) => {
	const res = await fetch('https://fees.muon.net/get-used-balance', {
		method: 'POST',
		body: JSON.stringify({ spender: account }),
		headers: { 'Content-Type': 'application/json' },
	})
	const data = await res.json()
	if (data.success) {
		const value = data.usedBalance ? utils.fromWei(data.usedBalance, 'ether') : 0
		return value
	} else {
		throw 'Unable to get used balance'
	}
}

// ==========================================================================
// SWAP TOKENS
// ==========================================================================

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
	} else {
		const contract = new web3.eth.Contract(Contracts.abi.Token, address)
		const res = await contract.methods.balanceOf(account).call()
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
	const contract = new web3.eth.Contract(Contracts.abi.Pair, token.pair)
	const res = await contract.methods.getReserves().call()
	const rate1 = utils.fromWei(res._reserve0, 'ether')
	const rate2 = utils.fromWei(res._reserve1, 'ether')
	return { rate1, rate2 }
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} address The token address to check allowance
 * @param {string} account The account address string
 * @param {boolean} swapAndDeposit If it is swap and deposit
 * @returns {Promise<number>} Returns allowance
 */

const checkSelectedTokenAllowance = async (web3, address, account, swapAndDeposit) => {
	const contract = new web3.eth.Contract(Contracts.abi.Token, address)
	const spender = swapAndDeposit ? Contracts.address.Swapper : Contracts.address.SmartRouter
	const res = await contract.methods.allowance(account, spender).call()
	const allowance = utils.fromWei(res, 'ether')
	return allowance
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} address The token address to approve
 * @param {number} amount The amount to deposit
 * @param {string} account The account address string
 * @param {boolean} swapAndDeposit If it is swap and deposit
 * @returns {Promise<any>} Returns deposit response
 */

const approveSwapTokens = async (web3, address, amount, account, swapAndDeposit) => {
	const contract = new web3.eth.Contract(Contracts.abi.Token, address)
	const spender = swapAndDeposit ? Contracts.address.Swapper : Contracts.address.SmartRouter
	const convertedAmount = utils.toWei(amount, 'ether')
	const res = await contract.methods.approve(spender, convertedAmount).send({ from: account })
	return res
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} valueToPay The amount to swap
 * @param {string} account The account address string
 * @param {object} token Then selected token object
 * @returns {Promise<any>} Returns swap response
 */

const swapTokens = async (web3, valueToPay, account, token) => {
	const contract = new web3.eth.Contract(Contracts.abi.SmartRouter, Contracts.address.SmartRouter)
	const amountIn = utils.toWei(valueToPay, 'ether')
	const amountOutMin = 0
	const path = token.route
	const res = await contract.methods
		.swapExactTokensForTokens(amountIn, amountOutMin, path, account)
		.send({ from: account, value: token.address !== '0x0' ? 0 : amountIn })
	return res
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} amount The amount to swap and deposit
 * @param {object} token The selected token object
 * @param {string} account The account address string
 * @returns {Promise<any>} Returns swap and deposit response
 */

const swapAndDeposit = async (web3, amount, token, account) => {
	const contract = new web3.eth.Contract(Contracts.abi.Swapper, Contracts.address.Swapper)
	const convertedAmount = utils.toWei(amount, 'ether')
	const res = await contract.methods[token.SADMethod](
		token.SADRequireValue ? '' : convertedAmount
	).send({ from: account, value: token.SADRequireValue ? convertedAmount : 0 })
	return res
}

// ==========================================================================
// DEPOSIT TOKEN
// ==========================================================================

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @returns {Promise<number>} Returns allowance
 */

const checkDepositAllowance = async (web3, account) => {
	const contract = new web3.eth.Contract(Contracts.abi.Token, Contracts.address.Token)
	const spender = Contracts.address.MuonFeeUpgradeable
	const res = await contract.methods.allowance(account, spender).call()
	const allowance = utils.fromWei(res, 'ether')
	return allowance
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} amount The amount to deposit
 * @param {string} account The account address string
 * @returns {Promise<any>} Returns deposit response
 */

const approveDepositToken = async (web3, amount, account) => {
	const contract = new web3.eth.Contract(Contracts.abi.Token, Contracts.address.Token)
	const spender = Contracts.address.MuonFeeUpgradeable
	const convertedAmount = utils.toWei(amount, 'ether')
	const res = await contract.methods.approve(spender, convertedAmount).send({ from: account })
	return res
}

/**
 * @param {Web3} web3 The Web3.js instance
 * @param {number} amount The amount to deposit
 * @param {string} account The account address string
 * @returns {Promise<any>} Returns deposit response
 */

const depositToken = async (web3, amount, account) => {
	const contract = new web3.eth.Contract(
		Contracts.abi.MuonFeeUpgradeable,
		Contracts.address.MuonFeeUpgradeable
	)
	const convertedAmount = utils.toWei(amount, 'ether')
	const res = await contract.methods.deposit(convertedAmount).send({ from: account })
	return res
}

// ==========================================================================
// SIGN AND REQUEST
// ==========================================================================

/**
 * @param {string} baseUrl The base url for request
 * @param {Web3} web3 The Web3.js instance
 * @param {string} account The account address string
 * @param {string} app The app name
 * @param {string} method The method name
 * @param {string} params The stringified params object
 * @returns {Promise<any>} Returns swap response
 */

const signAndRequest = async (baseUrl, web3, account, app, method, params) => {
	const timestamp = Math.floor(Date.now())
	const appId = Apps.find((i) => i.name === app).id

	const eip712TypedData = {
		types: {
			EIP712Domain: [{ type: 'string', name: 'name' }],
			Message: [
				{ type: 'address', name: 'address' },
				{ type: 'uint64', name: 'timestamp' },
				{ type: 'uint256', name: 'appId' },
			],
		},
		domain: { name: 'Muonize' },
		primaryType: 'Message',
		message: { address: account, timestamp, appId },
	}
	const dataToSign = JSON.stringify(eip712TypedData)

	const signature = await web3.currentProvider.request({
		id: Math.floor(Date.now() / 1000),
		jsonrpc: '2.0',
		method: 'eth_signTypedData_v4',
		params: [account, dataToSign],
	})

	const paramsObject = JSON.parse(params)
	let paramsToConcat = ''
	Object.entries(paramsObject).forEach((item) => {
		paramsToConcat = paramsToConcat.concat(`&params[${item[0]}]=${item[1]}`)
	})

	const url = `${baseUrl}?app=${app}&method=${method}${paramsToConcat}&fee[spender]=${account}&fee[timestamp]=${timestamp}&fee[signature]=${signature}`

	const res = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	})
	const data = await res.json()
	return data
}

module.exports = {
	detectProvider,
	checkWalletConnection,
	checkActiveChainId,
	detectAccountAndChainChange,
	removeEventListeners,

	getSelectedAccount,
	getWalletBalance,
	getDepositBalance,
	getUsedDepositedBalance,

	getSelectedTokenBalance,
	getPairExchangeRates,
	checkSelectedTokenAllowance,
	approveSwapTokens,
	swapTokens,
	swapAndDeposit,

	checkDepositAllowance,
	approveDepositToken,
	depositToken,
	signAndRequest,
}
