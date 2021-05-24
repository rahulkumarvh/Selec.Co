const order = require("../../../models/order")
const Order = require('../../../models/order')
const moment = require('moment')

function orderController() {
    return {
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, 
                { sort: { 'createdAt': -1} } )
            res.render('admin/orders', { orders: orders, moment: moment })
        }
    }
}

module.exports = orderController