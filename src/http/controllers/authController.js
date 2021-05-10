const { name } = require('ejs')
const User = require('../../models/sign-ups')
const bcrypt = require('bcryptjs')
const passport = require('passport')

function authController() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/views/orders.ejs'
    }


    return {
        login(req, res) {
            res.render("login")
        },
        postLogin(req, res, next) {
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/views/login.ejs')
                }
                req.logIn(user, () => {
                    if(err) {
                        req.flash('error', info.message)
                        return next(err) 
                    }


                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render("sign-up")
        },
        async postRegister(req, res) {
            const { firstname, lastname, email, password } = req.body
            //validate request
            if(!firstname || !lastname || !email || !password) {
                req.flash('error', 'All fields are required')
                req.flash('firstname', firstname)
                req.flash('lastname', lastname)
                req.flash('email', email)
                return res.redirect('/views/sign-up.ejs')
            }

            //Check if user exsists
            User.exists({ email: email }, (err, result) => {
                if(result) {
                    req.flash('error', 'Email already taken')
                    req.flash('firstname', firstname)
                    req.flash('lastname', lastname)
                    req.flash('email', email) 
                    return res.redirect('/views/sign-up.ejs')
                }
            })

            //hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            //Create a user
            const user = new User ({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword
            })

            user.save().then((user) => {
                //Login
                return res.redirect('/')
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/views/sign-up.ejs')
            })

        },
        logout(req, res) {
            req.logout()
            return res.redirect('/')
        }
    }
}


module.exports = authController