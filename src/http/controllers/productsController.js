const Product = require('../../models/product')

function productsController() {
    return {
        index(req, res) {
            Product.find().then(function(shops) {
                return res.render('products', { shops: shops })
            })
      }
    }
}


module.exports = productsController

