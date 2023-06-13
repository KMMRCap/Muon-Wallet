const $ = require('jquery')
const { Web3 } = require('web3')

let web3 = null
let accounts = null

const modalLayout = () => {
    return String.raw`
        <div id="muon-wallet">
            <div class="backdrop"></div>
            <div class="modal">
                <div class="modal-header">
                    <div class="logo">
                        <span class='logo-image'></span>
                        <div>
                            <h5>Muon</h5>
                            <h6>Wallet</h6>
                        </div>
                    </div>
                    <button class='close'></button>
                </div>
                <div class="modal-body">
                    <div class='account'>
                        <div>
                            <p>${accounts[0]?.slice(0, 6) + '...' + accounts[0]?.slice(-4)}</p>
                            <span>Wallet balance: 0.00 MUON</span>
                        </div>
                        <div class='dropdown-image'></div>
                    </div>
                    <div class='balance'>
                        <div></div>
                        <span>Deposited Balancen :</span>
                        <h3>30.30 MUON</h3>
                    </div>
                    <div class='actions'>
                        <h5 class='single'>DiBs</h5>
                        <div>
                            <h5 class='title'>Method:</h5>
                            <h5>Claim()</h5>
                        </div>
                        <div>
                            <h5 class='title'>Params:</h5>
                            <h5>{“roundId”:”8”} {“Params2”:”0”}</h5>
                        </div>
                        <div>
                            <h5 class='title'>Fee:</h5>
                            <div>
                                <h5>1.2 MUON</h5>
                                <h6>≈$0.1</h6>
                            </div>
                        </div>
                        <div class='buttons'>
                            <button class='cancel'>Reject</button>
                            <button class='submit'>Approve</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

const handleCloseModal = () => {
    const backdrop = $('#muon-wallet .backdrop')
    const closeButton = $('#muon-wallet .modal-header .close')
    const func = () => {
        $('#muon-wallet').addClass('closed')
        setTimeout(() => {
            $('#muon-wallet').remove()
        }, 700)
    }
    backdrop.on('click', func)
    closeButton.on('click', func)
}

const handleOpenModal = () => {
    $('body').append(modalLayout())
    handleCloseModal()
}

const requestConnect = async () => {
    try {
        if (window?.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            web3 = new Web3(window.ethereum)
            accounts = await web3.eth.getAccounts();
            handleOpenModal()
            web3.eth.net.isListening
        }
        else {
            console.log('No wallet found');
        }
    }
    catch (err) {
        console.error(err);
    }
}

const checkConnect = async () => {
    if (window?.ethereum) {
        const data = await window.ethereum.request({ method: 'eth_accounts' })
        if (data.length) {
            if (!web3) {
                web3 = new Web3(window.ethereum)
                if(!accounts?.length){
                    accounts = await web3.eth.getAccounts();
                }
            }
            handleOpenModal()
        }
        else {
            console.log('Not connected');
        }
    }
    else {
        console.error('No wallet found');
    }
}

module.exports = { checkConnect, requestConnect, accounts, web3 }