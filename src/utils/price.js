const priceHandler = (value) => {
    const number = Number(value)
    if (number) {
        return number.toFixed(6)
    }
    return 0
}

module.exports = { priceHandler }