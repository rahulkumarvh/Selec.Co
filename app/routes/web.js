const homeController = require('../src/http/controllers/homeController')
const authController = require('../src/http/controllers/authController')
const cartController = require('../src/http/controllers/customers/cartController')

function initRoutes(app) {

    app.get("/", (req, res) => {
        res.render("index")
    });

    app.get("/views/products.ejs", (req, res) => {
        res.render("products")
    });
    
    app.get("/views/cart.ejs", (req, res) => {
        res.render("cart")
    });
    
    app.get("/views/login.ejs", (req, res) => {
        res.render("login")
    });
    
    app.get("/views/sign-up.ejs", (req, res) => {
        res.render("sign-up")
    });
    
}



module.exports = initRoutes