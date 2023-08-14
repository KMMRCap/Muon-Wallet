const Contracts = {
	address: {
		MuonFeeUpgradeable: '0x31249D6c96b4B858a47bece989FBB83E2704A639',
		Token: '0x84102Df4B6Bcb72114532241894B2077428a7f86',
		SmartRouter: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
		Pair: '0x17CDD4542E47a9faE68c46A25BA85b13dF960E94',
	},
	abi: {
		MuonFeeUpgradeable: require('./MuonFeeUpgradeable.json'),
		Token: require('./Token.json'),
		SmartRouter: require('./SmartRouter.json'),
		Pair: require('./Pair.json'),
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
