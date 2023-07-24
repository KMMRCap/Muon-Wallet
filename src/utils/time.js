const fullFormat = () => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth()).padStart(2, 0)
    const day = String(new Date().getDate()).padStart(2, 0)
    const hours = String(new Date().getHours()).padStart(2, 0)
    const minutes = String(new Date().getMinutes()).padStart(2, 0)
    const seconds = String(new Date().getSeconds()).padStart(2, 0)

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

module.exports = { fullFormat }