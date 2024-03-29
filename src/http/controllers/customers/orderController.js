const Order = require('../../../models/order')
const moment = require('moment')

function orderController () {
    return {
        store(req, res) {
            //Validate request
            const { email, address } = req.body
            if(!email || !address) {
                req.flash('error', 'All fields are required')
                return res.redirect('/cart')
            }


            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                email,
                address
            })
            order.save().then(result => {
                req.flash('success', 'Order placed successfully')
                delete req.session.cart
                return res.redirect('/views/orders.ejs')
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/cart')
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, 
                { sort: { 'createdAt': -1} } )
            res.header('Cache-Control', 'no-store')
            res.render('orders.ejs', { orders: orders, moment: moment })
        }
    }
}

module.exports = orderController