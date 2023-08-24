const Contracts = {
	address: {
		MuonFeeUpgradeable: '0x4c00A64Addb992a352e5147b791b310B17432a2b',
		Token: '0xF43CD517385237fe7A48927073151D12f4eADC53',
		SmartRouter: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
		Pair: '0xb82ce77fe7ba7253f133b7b6935df0545e33dbb9',
	},
	abi: {
		MuonFeeUpgradeable: require('./abi/MuonFeeUpgradeable.json'),
		Token: require('./abi/Token.json'),
		SmartRouter: require('./abi/SmartRouter.json'),
		Pair: require('./abi/Pair.json'),
	},
}

module.exports = { Contracts }

// Used Methods :

// MuonFeeUpgradeable :
// R: users(address)
// W: deposit(amount)

// Token :
// R: balanceOf(address) - allowance(account, spender)
// W: approve(spender, amount)

// SmartRouter :
// W: swapExactTokensForTokens(amountIn, amountOutMin, path, to)

// Pair :
// R: getReserves()
