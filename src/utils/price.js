const priceHandler = (value) => {
    const number = Number(value)
    if (number) {
        return number.toFixed(6)
    }
    return 0
}

const exchageRateCalculator = (amountIn, reserveIn, reserveOut) => {
    if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) {
        return 0
    }
    const amountInWithFee = amountIn * 9975
    const numerator = amountInWithFee * reserveOut
    const denominator = (reserveIn * 10000) + amountInWithFee
    return numerator / denominator
}

module.exports = { priceHandler, exchageRateCalculator }