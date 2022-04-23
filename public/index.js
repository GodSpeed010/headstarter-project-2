if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

const ticketPrice = 10000

function ready() {
    var buyTicketButtons = document.getElementsByClassName('tour-btn')
    for (var i = 0; i < buyTicketButtons.length; i++) {
        var button = buyTicketButtons[i]
        button.addEventListener('click', buyTicket)
    }
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'en',
    token: function(token) {

        fetch('/purchase/ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id
            })
        }).then(function(res) {
            return res.json()
        }).then(function(data) {
            alert(data.message)
        }).catch(function(error) {
            console.log(error)
        })
    }
})

function buyTicket(event) {
    stripeHandler.open({
        amount: ticketPrice
    })
}