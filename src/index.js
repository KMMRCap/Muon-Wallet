const $ = require('jquery')
const { Web3 } = require('web3')

const {
    detectProvider, checkWalletConnection,
    getSelectedAccount, getWalletBalance, getDepositBalance,
    getSelectedTokenBalance, checkSelectedTokenAllowance, approveSwapTokens, getPairExchangeRates, swapTokens,
    checkDepositAllowance, approveDepositToken, depositToken, signAndRequest,
} = require('./web3Actions')
const { priceHandler, exchageRateCalculator } = require('./utils/price')

const Tokens = require('./utils/Tokens.json')
const Apps = require('./utils/Apps.json')

"use strict";

// -------------------------------------------------
// CONSTANTS

const TOKEN_NAME = 'ALICE'

// -------------------------------------------------
// Variables

let resolver = null
let rejecter = null

let app = null
let method = null
let params = null

let web3Instance = null

let accountAddress = null

let walletBalance = null
let depositBalance = null

let fee = 1.2
let convertedFee = 0.1

let selectedToken = null
let selectedTokenBalance = 0
let rate1 = 0
let rate2 = 0
let swapInputValue = 0
let swapAllowance = 0
// let allowBuyAndDeposit = false

let depositInputValue = 0
let allowance = 0


// -------------------------------------------------
// Modal Contents

const modalLayout = () => {
    return String.raw`
        <div id="muon-wallet">
            <div class="backdrop"></div>
            <div class="muon-modal">
                
                <div class="muon-modal-header">
                    <div class="logo">
                        <span class='logo-image'></span>
                        <div>
                            <h5>${TOKEN_NAME}</h5>
                            <h6>Wallet</h6>
                        </div>
                    </div>
                    <button class='close'></button>
                </div>

                <div class='account'>
                    <div>
                        <p>${accountAddress?.slice(0, 6) + '...' + accountAddress?.slice(-4)}</p>
                        <span>Wallet balance: <span>${priceHandler(walletBalance)}</span> ${TOKEN_NAME}</span>
                    </div>
                </div>

                <div class="muon-modal-body"></div>
            </div>
        </div>
    `
}

const signSection = () => {
    return String.raw`
        <section class='sign-section'>
            <div class='balance'>
                <div></div>
                <span>Deposited Balance :</span>
                <h3>${priceHandler(depositBalance)} ${TOKEN_NAME}</h3>
            </div>
            <div class='actions'>
                <div>
                    <h5 class='bold'>${app}</h5>
                </div>
                <div>
                    <h5>Method:</h5>
                    <h5 class='bold'>${method}()</h5>
                </div>
                <div>
                    <h5>Params:</h5>
                    <h5 class='bold'>${params}</h5>
                </div>
                <div>
                    <h5>Fee:</h5>
                    <div>
                        <h5 class='bold'>${fee} ${TOKEN_NAME}</h5>
                        <h6>≈$${convertedFee}</h6>
                    </div>
                </div>
                <div class='buttons'>
                    <button class='cancel'>Reject</button>
                    <button class='submit'>Approve</button>
                </div>
            </div>
        </section>
    `
}

const outOfWalletBalanceSection = () => {
    return String.raw`
        <section class='out-of-wallet-balance-section'>
            <div class='balance'>
                <div></div>
                <span>Deposited Balance :</span>
                <h3>${priceHandler(depositBalance)} ${TOKEN_NAME}</h3>
            </div>
            <div class='out-buttons'>
                <button class='buy'>Buy</button>
            </div>
            <div class='actions'>
                <div>
                    <h5 class='bold'>${app}</h5>
                    <div class='insufficient'>
                        <h5>Insufficient Balance</h5>
                        <span></span>
                    </div>
                </div>
                <div>
                    <h5>Method:</h5>
                    <h5 class='bold'>${method}()</h5>
                </div>
                <div>
                    <h5>Params:</h5>
                    <h5 class='bold'>${params}</h5>
                </div>
                <div>
                    <h5>Fee:</h5>
                    <div>
                        <h5 class='bold'>${fee} ${TOKEN_NAME}</h5>
                        <h6>≈$${convertedFee}</h6>
                    </div>
                </div>
                <div class='buttons'>
                    <button class='cancel'>Reject</button>
                    <button class='submit' disabled>Approve</button>
                </div>
            </div>
        </section>
    `
}

const outOfDepositBalanceSection = () => {
    return String.raw`
        <section class='out-of-deposit-balance-section'>
            <div class='balance'>
                <div></div>
                <span>Deposited Balance :</span>
                <h3>${priceHandler(depositBalance)} ${TOKEN_NAME}</h3>
            </div>
            <div class='out-buttons'>
                <button class='deposit'>Deposit</button>
                <button class='buy'>Buy</button>
            </div>
            <div class='actions'>
                <div>
                    <h5 class='bold'>${app}</h5>
                    <div class='insufficient'>
                        <h5>Insufficient Balance</h5>
                        <span></span>
                    </div>
                </div>
                <div>
                    <h5>Method:</h5>
                    <h5 class='bold'>${method}()</h5>
                </div>
                <div>
                    <h5>Params:</h5>
                    <h5 class='bold'>${params}</h5>
                </div>
                <div>
                    <h5>Fee:</h5>
                    <div>
                        <h5 class='bold'>${fee} ${TOKEN_NAME}</h5>
                        <h6>≈$${convertedFee}</h6>
                    </div>
                </div>
                <div class='buttons'>
                    <button class='cancel'>Reject</button>
                    <button class='submit' disabled>Approve</button>
                </div>
            </div>
        </section>
    `
}

const buySection = () => {
    return String.raw`
        <section class='buy-section'>
            <div class='balance-cont'>
                <div class='logo'></div>
                <div class='balance'>
                    <span>Deposited Balance:</span>
                    <h6>${priceHandler(depositBalance)} ${TOKEN_NAME}</h6>
                </div>
            </div>
            <div class='swap-actions'>
                <div class='title'>
                    <h5>Buy ${TOKEN_NAME}</h5>
                </div>
                <div class='swap-box'>
                    <div class='from'>
                        <input type='number' value='0.00' placeholder='0.00' />
                        <div class='data'>
                            <h6>Balance: <span>0</span></h6>
                            <button>
                                <span></span>
                                <h5>${selectedToken?.name || Tokens[1].name}</h5>
                                <ul class='tokens-list'></ul>
                            </button>
                            <div class='logo'></div>
                        </div>
                    </div>
                    <div class='to'>
                        <span class='converted'>0.00</span>
                        <div class='data'>
                            <h6>Balance: ${priceHandler(walletBalance)}</h6>
                            <h5>${TOKEN_NAME}</h5>
                            <div class='logo'></div>
                        </div>
                    </div>
                </div>
                <div class='allowance'>
                    <h6>Allowance: <span>${priceHandler(swapAllowance)}</span> <span>${selectedToken?.name || Tokens[1].name}</span></h6>
                </div>
                <!-- <div class='checkbox'>
                    <input type="checkbox" name="checkbox" id='check-buy-and-deposit' />
                    <label for='check-buy-and-deposit'>Buy and Deposit to Account</label>
                </div> -->
                <button class='buy-and-deposit'>Buy</button>
            </div>
        </section>
    `
}

const depositSection = () => {
    return String.raw`
        <section class='buy-section deposit'>
        <div class='balance-cont'>
                <div class='logo'></div>
                <div class='balance'>
                    <span>Deposited Balance:</span>
                    <h6>${priceHandler(depositBalance)} ${TOKEN_NAME}</h6>
                </div>
            </div>
            <div class='swap-actions'>
                <div class='title'>
                    <h5>Deposit ${TOKEN_NAME}</h5>
                </div>
                <div class='swap-box'>
                    <div class='to'>
                        <input type='number' value='0.00' placeholder='0.00' />
                        <div class='data'>
                            <h6>Balance: ${priceHandler(walletBalance)}</h6>
                            <h5>${TOKEN_NAME}</h5>
                            <div class='logo'></div>
                        </div>
                    </div>
                    <div class='allowance'>
                        <h6>Allowance: <span>${priceHandler(allowance)}</span> ${TOKEN_NAME}</h6>
                    </div>
                </div>
                <button class='deposit'>Approve Deposit</button>
            </div>
        </section>
    `
}

// -------------------------------------------------
// Modal Content Handlers

const handleCloseModal = (data) => {
    $('#muon-wallet').addClass('closed')
    setTimeout(() => {
        $('#muon-wallet').remove()
        if (data) {
            resolver(data)
        }
        else {
            rejecter('Modal closed without any result')
        }
    }, 700);
}

const handleCloseButtons = () => {
    const backdrop = $('#muon-wallet .backdrop')
    const closeButton = $('#muon-wallet .muon-modal-header .close')
    const rejectButton = $('#muon-wallet .muon-modal-body .actions .buttons .cancel')
    backdrop.on('click', () => handleCloseModal())
    closeButton.on('click', () => handleCloseModal())
    if (rejectButton) {
        rejectButton.on('click', () => handleCloseModal())
    }
}

// ----------

const signSectionHandler = () => {
    const modalBody = $('#muon-wallet .muon-modal-body')
    $(modalBody).empty()
    $(modalBody).append(signSection())
    handleCloseButtons()

    const button = $('#muon-wallet .muon-modal-body .actions .buttons .submit')

    $(button).on('click', async () => {
        try {
            handleLoadingButton(button, true)
            const data = await signAndRequest(web3Instance, accountAddress, app, method, params)
            handleLoadingButton(button, false)
            handleCloseModal(data)
        }
        catch (err) {
            console.error(err);
            handleLoadingButton(button, false)
        }
    })
}

const outOfWalletBalanceSectionHandler = () => {
    const modalBody = $('#muon-wallet .muon-modal-body')
    $(modalBody).empty()
    $(modalBody).append(outOfWalletBalanceSection())
    handleCloseButtons()

    const button = $('#muon-wallet .muon-modal-body .out-buttons .buy')

    $(button).on('click', () => {
        buySectionHandler()
    })
}

const outOfDepositBalanceSectionHandler = () => {
    const modalBody = $('#muon-wallet .muon-modal-body')
    $(modalBody).empty()
    $(modalBody).append(outOfDepositBalanceSection())
    handleCloseButtons()

    const buyButton = $('#muon-wallet .muon-modal-body .out-buttons .buy')
    const depositButton = $('#muon-wallet .muon-modal-body .out-buttons .deposit')

    $(buyButton).on('click', () => {
        buySectionHandler()
    })
    $(depositButton).on('click', () => {
        depositSectionHandler()
    })
}

const buySectionHandler = () => {
    const modalBody = $('#muon-wallet .muon-modal-body')
    $(modalBody).empty()
    $(modalBody).append(buySection())
    handleCloseButtons()

    const selectboxButton = $('#muon-wallet .muon-modal-body .swap-box .from button')
    const selectboxText = $('#muon-wallet .muon-modal-body .swap-box .from button h5')
    const dropdown = $('#muon-wallet .muon-modal-body .swap-box .from button ul')
    const input = $('#muon-wallet .muon-modal-body .swap-box .from input')
    const logo = $('#muon-wallet .muon-modal-body .swap-box .from .logo')
    const button = $('#muon-wallet .muon-modal-body .swap-actions .buy-and-deposit')
    const allowanceDiv = $('#muon-wallet .muon-modal-body .swap-actions .allowance')
    const allowanceValue = $('#muon-wallet .muon-modal-body .swap-actions .allowance h6 span:first-child')
    const allowanceToken = $('#muon-wallet .muon-modal-body .swap-actions .allowance h6 span:last-child')
    // const checkbox = $('#muon-wallet .muon-modal-body .swap-actions .checkbox input')

    Tokens.forEach(i => {
        $(dropdown).append(`<li>${i.name}</li>`);
    })

    const dropdownItem = $('#muon-wallet .muon-modal-body .swap-box .from button ul li')

    selectedToken = selectedToken || Tokens[0]
    $(selectboxText).text(selectedToken?.name)
    $(input).val(swapInputValue)
    // $(checkbox).val(allowBuyAndDeposit)
    // $(button).text(allowBuyAndDeposit ? 'Buy & Deposit' : 'Buy')

    $(selectboxButton).on('click', (e) => {
        $(dropdown).toggle()
    })

    const handleButtonOnAllowance = (value) => {
        if (selectedToken.address === '0x0') {
            $(button).text('Buy')
        }
        else {
            if (value > swapAllowance) {
                $(button).text('Approve')
            }
            else {
                $(button).text('Buy')
            }
        }
    }

    const handleCheckSwapAllowance = async () => {
        if (selectedToken.address === '0x0') {
            $(allowanceDiv).hide()
        }
        else {
            $(allowanceDiv).show()
            const value = await checkSelectedTokenAllowance(web3Instance, selectedToken.address, accountAddress)
            swapAllowance = Number(value)
            $(allowanceValue).text(priceHandler(swapAllowance))
            $(allowanceToken).text(selectedToken.name)
        }
    }

    const handleSelectedTokenBalance = async () => {
        handleLoadingButton(button, true)

        Tokens.forEach(i => {
            $(logo).removeClass(i.icon)
        })
        $(logo).addClass(selectedToken.icon)

        await handleCheckSwapAllowance()

        const balance = await getSelectedTokenBalance(web3Instance, accountAddress, selectedToken.address)
        selectedTokenBalance = balance
        $('#muon-wallet .muon-modal-body .swap-actions .from h6 span').text(priceHandler(selectedTokenBalance))

        await handleSwapInputValues(swapInputValue)
        handleLoadingButton(button, false)
    }

    const handleSwapInputValues = async (value) => {
        handleLoadingButton(button, true)
        swapInputValue = Number(value)
        const inputbox = $('#muon-wallet .muon-modal-body .swap-actions .from')
        if (!swapInputValue) {
            $(inputbox).css('border', 'none')
            handleDisableButton(button, true)
        }
        else if (swapInputValue > selectedTokenBalance) {
            $(inputbox).css('border', '1px solid red')
            handleDisableButton(button, true)
        }
        else {
            $(inputbox).css('border', 'none')
            handleDisableButton(button, false)
        }
        const res = await getPairExchangeRates(web3Instance, selectedToken)
        rate1 = Number(selectedToken.reversed ? res.rate2 : res.rate1)
        rate2 = Number(selectedToken.reversed ? res.rate1 : res.rate2)

        const convertedValue = exchageRateCalculator(swapInputValue, rate1, rate2)
        const resultSpan = $('#muon-wallet .muon-modal-body .swap-actions .to .converted')
        $(resultSpan).text(priceHandler(convertedValue))

        handleButtonOnAllowance(value)
        handleLoadingButton(button, false)
    }

    handleSelectedTokenBalance()
    handleSwapInputValues(swapInputValue)

    $(dropdownItem).each((index, item) => {
        $(item).on('click', () => {
            if (selectedToken.name !== Tokens[index].name) {
                selectedToken = Tokens[index]
                handleSelectedTokenBalance()
            }
        })
    })

    let debounce = null
    $(input).on('input', (e) => {
        clearTimeout(debounce)
        debounce = setTimeout(() => {
            handleSwapInputValues(e.target.value)
        }, 1500);
    })

    // $(checkbox).on('change', (e) => {
    //     $(e).val(!allowBuyAndDeposit)
    //     allowBuyAndDeposit = !allowBuyAndDeposit
    //     $(button).text(allowBuyAndDeposit ? 'Buy & Deposit' : 'Buy')
    // })

    $(button).on('click', async () => {
        if (!selectedToken?.name || !swapInputValue || !rate1 || !rate2) {
            console.error('Value to buy is not specified');
            return
        }
        try {
            if (selectedToken.address !== '0x0' && swapInputValue > swapAllowance) {
                handleLoadingButton(button, true)
                await approveSwapTokens(web3Instance, selectedToken.address, swapInputValue, accountAddress)
                await handleCheckSwapAllowance()
                handleButtonOnAllowance()
                handleLoadingButton(button, false)
            }
            else {
                handleLoadingButton(button, true)
                await swapTokens(web3Instance, swapInputValue, accountAddress, selectedToken)

                const balance = await getWalletBalance(web3Instance, accountAddress)
                walletBalance = Number(balance)
                $('#muon-wallet .account span span').text(priceHandler(walletBalance))
                handleLoadingButton(button, false)

                outOfDepositBalanceSectionHandler()
            }
        }
        catch (err) {
            console.error(err);
            handleLoadingButton(button, false)
        }
    })
}

const depositSectionHandler = () => {
    const modalBody = $('#muon-wallet .muon-modal-body')
    $(modalBody).empty()
    $(modalBody).append(depositSection())
    handleCloseButtons()

    const input = $('#muon-wallet .muon-modal-body .swap-actions .to input')
    const inputbox = $('#muon-wallet .muon-modal-body .swap-actions .to')
    const button = $('#muon-wallet .muon-modal-body .swap-actions .deposit')
    const allowanceText = $('#muon-wallet .muon-modal-body .swap-actions .allowance h6 span')

    $(input).val(depositInputValue)

    const handleButtonText = () => {
        if (allowance >= depositInputValue && depositInputValue) {
            $(button).text('Deposit')
        }
        else {
            $(button).text('Approve Deposit')
        }
    }

    const handleCheckDepositAllowance = async () => {
        const value = await checkDepositAllowance(web3Instance, accountAddress)
        allowance = Number(value)
        $(allowanceText).text(allowance)
        handleButtonText()
    }

    const handleDepositInputValue = (value) => {
        depositInputValue = Number(value)
        handleButtonText()
        if (!depositInputValue) {
            $(inputbox).css('border', 'none')
            handleDisableButton(button, true)
        }
        else if (depositInputValue > walletBalance) {
            $(inputbox).css('border', '1px solid red')
            handleDisableButton(button, true)
        }
        else {
            $(inputbox).css('border', 'none')
            handleDisableButton(button, false)
        }
    }

    handleCheckDepositAllowance()
    handleDepositInputValue(depositInputValue)

    $(input).on('input', (e) => {
        handleDepositInputValue(e.target.value)
    })
    $(button).on('click', async () => {
        if (!walletBalance) {
            console.error('Wallet Balance is 0');
            return
        }
        if (!depositInputValue) {
            console.error('Deposit Value is 0');
            return
        }
        try {
            if (allowance >= depositInputValue) {
                handleLoadingButton(button, true)
                await depositToken(web3Instance, depositInputValue, accountAddress)

                const balance = await getDepositBalance(web3Instance, accountAddress)
                depositBalance = Number(balance)
                handleLoadingButton(button, false)

                if (depositBalance >= fee) {
                    signSectionHandler()
                }
                else {
                    outOfDepositBalanceSectionHandler()
                }
            }
            else {
                handleLoadingButton(button, true)
                await approveDepositToken(web3Instance, depositInputValue, accountAddress)
                await handleCheckDepositAllowance()
                handleLoadingButton(button, false)
            }
        }
        catch (err) {
            console.error(err);
            handleLoadingButton(button, false)
        }
    })
}

// ----------

const handleOpenModal = () => {
    $('body').append(modalLayout())
    handleContent()
}

const handleContent = () => {
    if (depositBalance >= fee) {
        signSectionHandler()
    }
    else if (walletBalance) {
        outOfDepositBalanceSectionHandler()
    }
    else {
        outOfWalletBalanceSectionHandler()
    }
}

const handleDisableButton = (elem, status) => {
    $(elem).prop('disabled', status)
}

const handleLoadingButton = (elem, status) => {
    if (status) {
        $(elem).append('<div class="loading"></div>')
    }
    else {
        $('.loading').remove()
    }
}

// -------------------------------------------------
// Modal Wallet Request

/**
 * @param {string} appName The string
 * @param {string} methodName The string
 * @param {object} parameters The string
 * @returns {Promise<any>}
 */

const request = (appName, methodName, parameters) => {
    if (!appName || !methodName || (!parameters || typeof parameters !== 'object')) {
        console.error('All parameters should be present');
        return
    }
    const promise = new Promise(async (resolve, reject) => {
        resolver = resolve
        rejecter = reject

        try {
            const appFound = Apps.find(i => i.name === appName.toLowerCase())
            if (!appFound) {
                throw 'App not found'
            }
            else {
                const methodFound = appFound.methods.find(i => i === methodName.toLowerCase())
                if (!methodFound) {
                    throw 'Method not found'
                }
            }
            app = appName.toLowerCase()
            method = methodName.toLowerCase()
            params = JSON.stringify(parameters)

            const provider = await detectProvider()
            web3Instance = new Web3(provider)

            checkWalletConnection()

            accountAddress = await getSelectedAccount(web3Instance)
            const res1 = getWalletBalance(web3Instance, accountAddress)
            const res2 = getDepositBalance(web3Instance, accountAddress)
            const allRes = await Promise.all([res1, res2])
            walletBalance = Number(allRes[0])
            depositBalance = Number(allRes[1])

            handleOpenModal()
        }
        catch (err) {
            rejecter(err)
        }
    })
    return promise
}

module.exports = { request }