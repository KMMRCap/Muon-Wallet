const $ = require('jquery')
const { Web3 } = require('web3')

const {
    detectProvider, checkWalletConnection, getSelectedAccount,
    getWalletMuonBalance, getDepositedMuonBalance, getSelectedTokenBalance,
    getPairExchangeRates, buyMuon, checkAllowance, approveDeposit, depositMuon, approve,
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
// let allowBuyAndDeposit = false

let depositInputValue = 0
let allowance = 0


// -------------------------------------------------
// Modal Contents

const modalLayout = () => {
    return String.raw`
        <div id="muon-wallet">
            <div class="backdrop"></div>
            <div class="modal">
                
                <div class="modal-header">
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
                        <span>Wallet balance: ${priceHandler(walletBalance)} ${TOKEN_NAME}</span>
                    </div>
                    <!-- <div class='dropdown-image'></div> -->
                </div>

                <div class="modal-body"></div>
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
                            <select></select>
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
                        <h6>Allowance: <span>${allowance}</span> ${TOKEN_NAME}</h6>
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
    const closeButton = $('#muon-wallet .modal-header .close')
    const rejectButton = $('#muon-wallet .modal-body .actions .buttons .cancel')
    backdrop.on('click', () => handleCloseModal())
    closeButton.on('click', () => handleCloseModal())
    if (rejectButton) {
        rejectButton.on('click', () => handleCloseModal())
    }
}

// ----------

const signSectionHandler = () => {
    const modalBody = $('#muon-wallet .modal-body')
    $(modalBody).empty()
    $(modalBody).append(signSection())
    handleCloseButtons()

    const button = $('#muon-wallet .modal-body .actions .buttons .submit')

    $(button).on('click', async () => {
        try {
            handleLoadingButton(button, true)
            const data = await approve(web3Instance, accountAddress, app, method, params)
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
    const modalBody = $('#muon-wallet .modal-body')
    $(modalBody).empty()
    $(modalBody).append(outOfWalletBalanceSection())
    handleCloseButtons()

    const button = $('#muon-wallet .modal-body .out-buttons .buy')

    $(button).on('click', () => {
        buySectionHandler()
    })
}

const outOfDepositBalanceSectionHandler = () => {
    const modalBody = $('#muon-wallet .modal-body')
    $(modalBody).empty()
    $(modalBody).append(outOfDepositBalanceSection())
    handleCloseButtons()

    const buyButton = $('#muon-wallet .modal-body .out-buttons .buy')
    const depositButton = $('#muon-wallet .modal-body .out-buttons .deposit')

    $(buyButton).on('click', () => {
        buySectionHandler()
    })
    $(depositButton).on('click', () => {
        depositSectionHandler()
    })
}

const buySectionHandler = () => {
    const modalBody = $('#muon-wallet .modal-body')
    $(modalBody).empty()
    $(modalBody).append(buySection())
    handleCloseButtons()

    const selectbox = $('#muon-wallet .modal-body .swap-box .from select')
    const input = $('#muon-wallet .modal-body .swap-box .from input')
    const button = $('#muon-wallet .modal-body .swap-actions .buy-and-deposit')
    // const checkbox = $('#muon-wallet .modal-body .swap-actions .checkbox input')

    Tokens.forEach(i => {
        $(selectbox).append($('<option>', { value: i.name, text: i.name }));
    })
    selectedToken = selectedToken || Tokens[0]
    $(selectbox).val(selectedToken?.name)
    $(input).val(swapInputValue)
    // $(checkbox).val(allowBuyAndDeposit)
    // $(button).text(allowBuyAndDeposit ? 'Buy & Deposit' : 'Buy')

    const handleSelectedTokenBalance = async () => {
        handleLoadingButton(button, true)
        const balance = await getSelectedTokenBalance(web3Instance, accountAddress, selectedToken.address)
        selectedTokenBalance = balance
        $('#muon-wallet .modal-body .swap-actions .from h6 span').text(priceHandler(selectedTokenBalance))
        handleLoadingButton(button, false)
    }

    const handleSwapInputValues = async (value) => {
        handleLoadingButton(button, true)
        swapInputValue = Number(value)
        const inputbox = $('#muon-wallet .modal-body .swap-actions .from')
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
        const resultSpan = $('#muon-wallet .modal-body .swap-actions .to .converted')
        $(resultSpan).text(priceHandler(convertedValue))
        handleLoadingButton(button, false)
    }

    handleSelectedTokenBalance()
    handleSwapInputValues(swapInputValue)

    $(selectbox).on('change', (e) => {
        const found = Tokens.find(i => i.name === e.target.value)
        selectedToken = found
        handleSelectedTokenBalance()
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
            handleLoadingButton(button, true)
            await buyMuon(web3Instance, swapInputValue, accountAddress, selectedToken.address)

            const balance = await getWalletMuonBalance(web3Instance, accountAddress)
            walletBalance = Number(balance)
            handleLoadingButton(button, false)

            if (walletBalance) {
                depositSectionHandler()
            }
            else {
                buySectionHandler()
            }
        }
        catch (err) {
            console.error(err);
            handleLoadingButton(button, false)
        }
    })
}

const depositSectionHandler = () => {
    const modalBody = $('#muon-wallet .modal-body')
    $(modalBody).empty()
    $(modalBody).append(depositSection())
    handleCloseButtons()

    const input = $('#muon-wallet .modal-body .swap-actions .to input')
    const inputbox = $('#muon-wallet .modal-body .swap-actions .to')
    const button = $('#muon-wallet .modal-body .swap-actions .deposit')
    const allowanceText = $('#muon-wallet .modal-body .swap-actions .allowance h6 span')

    $(input).val(depositInputValue)

    const handleCheckAllowance = async () => {
        const value = await checkAllowance(web3Instance, accountAddress)
        allowance = Number(value)
        $(allowanceText).text(allowance)
        if (allowance >= depositInputValue && depositInputValue) {
            $(button).text('Deposit')
        }
        else {
            $(button).text('Approve Deposit')
        }
    }

    const handleDepositInputValue = (value) => {
        depositInputValue = Number(value)
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

    handleCheckAllowance()
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
                await depositMuon(web3Instance, depositInputValue, accountAddress)

                const balance = await getDepositedMuonBalance(web3Instance, accountAddress)
                depositBalance = Number(balance)
                handleLoadingButton(button, false)

                if (depositBalance >= fee) {
                    signSectionHandler()
                }
            }
            else {
                handleLoadingButton(button, true)
                await approveDeposit(web3Instance, depositInputValue, accountAddress)
                await handleCheckAllowance()
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
            const res1 = getWalletMuonBalance(web3Instance, accountAddress)
            const res2 = getDepositedMuonBalance(web3Instance, accountAddress)
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