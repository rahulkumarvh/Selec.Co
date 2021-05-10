function eubController() {
    return {
        index(req, res) {
            res.render("eub.ejs", {products: products})
        }
    }
}


module.exports = eubController