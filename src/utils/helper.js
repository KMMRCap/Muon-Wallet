const priceHandler = (value) => {
	const number = Number(value)
	if (number) {
		return Number(number.toFixed(6))
	}
	return 0
}

const exchageRateCalculator = (amountIn, reserveIn, reserveOut) => {
	if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) {
		return 0
	}
	const amountInWithFee = amountIn * 9975
	const numerator = amountInWithFee * reserveOut
	const denominator = reserveIn * 10000 + amountInWithFee
	return numerator / denominator
}

const paramsHandler = (params) => {
	return params
		.map((i) => {
			let a = i[0]
			let b = typeof i[1] !== 'object' ? String(i[1]) : JSON.stringify(i[1])
			return `<span>${a}: ${b.length > 15 ? b.slice(0, 7) + '...' + b.slice(-7) : b}</span>`
		})
		.join('')
}

module.exports = { priceHandler, exchageRateCalculator, paramsHandler }
