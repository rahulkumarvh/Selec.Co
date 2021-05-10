import axios from 'axios'
import Noty from 'noty'
import moment from 'moment'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(shop) {
    axios.post('/update-cart', shop).then(res => {
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'warning',
            timeout: 1000,
            theme: 'nest',
            layout: 'topRight',
            progressBar: false,
            text: "Item added to cart"
          }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            theme: 'nest',
            layout: 'topRight',
            progressBar: false,
            text: "Something went wrong"
          }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click',(e) => {
        let shop = JSON.parse(btn.dataset.shop)
        updateCart(shop);
    })
})

//Remove alert message after X seconds

const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}








