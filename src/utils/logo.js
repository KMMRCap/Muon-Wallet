const bnbLogo = require('../images/tokens/bnb.png')
const usdcLogo = require('../images/tokens/usdc.png')

const $ = require('jquery')

const logoHandler = (token, elem) => {
    let icon = null

    switch (token) {
        case 'bnb':
            icon = bnbLogo;
            break;
        case 'usdc':
            icon = usdcLogo;
            break;
        default:
            icon = bnbLogo;
            break;
    }

    $(elem).css('backgroundImage', `url(${icon})`)
}

module.exports = { logoHandler }