require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const methodOverride = require('method-override')

//database connection

const url = 'mongodb://localhost/shop';


// const MONGO_URL = 'mongodb+srv://rahul:mVAhvOyw5enTcn7b@selec.7pzf6.mongodb.net/shop?retryWrites=true&w=majority'


mongoose.connect(process.env.MONGO_CONNECTION_URL || url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});

//session store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//session config
app.use(session({
   secret: 'mysecretcookie',
   resave: false,
   store: mongoStore,
   saveUninitialized: false,
   cookie: { maxAge: 1000 * 60 * 60 * 24} // 24 hours
}))

//shortUrl
const ShortUrl = require('./models/shortUrl')

//passport config
const passportInit = require('./config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

//method-overide
app.use(methodOverride('_method'))


app.use(flash())

//database required and connected
require("./db/conn");
const Register = require("./models/sign-ups");
const Product = require("./models/product");

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//controller required
const homeController = require("./http/controllers/homeController");
const cartController = require("./http/controllers/customers/cartController");
const orderController = require("./http/controllers/customers/orderController");
const productsController = require("./http/controllers/productsController");
const authController = require("./http/controllers/authController");
const AdminOrderController = require("./http/controllers/admin/orderController");
const statusController = require("./http/controllers/admin/statusController");
const eubController = require("./http/controllers/eubController")

//middlewares
const guest = require("../src/http/middlewares/guest")
const auth = require("../src/http/middlewares/auth")
const admin = require("../src/http/middlewares/admin");
const { override } = require('laravel-mix');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

//global middlewares
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

//setting template engine
app.use(express.static(static_path));
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

//controllers
app.get("/", homeController().index) 
app.get("/views/products.ejs", productsController().index)


//eub

app.get("/views/eub/edit/:id",  async (req,res) => {
    const product =  await Product.findById(req.params.id)
    res.render('edit', { product: product })
})


app.get("/views/eub", admin, async(req,res) => {
    const products = await Product.find().sort({
        createdAt: 'desc'
    })
    res.render('eub', { products: products })
})


//new product
app.get("/views/eub/new", (req,res) => {
    res.render('new', { product: new Product() })
})

app.post('/views/eub/', async (req,res, next) => {
    req.product = new Product()
    next()
}, saveArticleAndRedirect('new'))



function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let product = req.product
            product.name= req.body.name
            product.image= req.body.image
            product.price= req.body.price
     
         try {
             product = await product.save()
             res.redirect("/views/eub/")
         } catch(e) {
             res.render(`${path}`, { product: product })
             console.log(e);
         }
    }
}



app.put('/views/eub/edit/:id',  async (req,res, next) => {
    req.product =  await Product.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))


app.delete('/eub/:id', async(req,res) => {
    await Product.findByIdAndDelete(req.params.id)
    res.redirect('/views/eub')
})


//custom links
app.get("/views/eub/link", async (req,res) => {
    const shortUrls = await ShortUrl.find()
    res.render('link', { shortUrls: shortUrls })
})

app.post("/views/eub/link/shortUrls", async (req,res) => {
    await ShortUrl.create({ full: req.body.fullUrl })
    res.redirect('/views/eub/link')
})

app.get('/views/eub/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)

    shortUrl.clicks++
    shortUrl.save()

    res.redirect(shortUrl.full)
})



//customer routes
app.get("/views/cart.ejs", cartController().index)
app.post('/update-cart', cartController().update)
app.post('/orders', auth, orderController().store)
app.get('/views/orders.ejs', auth, orderController().index)


//admin routes
app.get('/admin/orders', admin, AdminOrderController().index)
// app.post('/admin/order/status', admin, statusController().update)

app.get("/views/login.ejs", guest, authController().login)
app.post("/login", authController().postLogin)
app.get("/views/sign-up.ejs", guest, authController().register)
app.post("/sign-up", authController().postRegister)
app.post('/logout', authController().logout)


// app.post("/sign-up", async (req, res) => {
//     try {
        
//         const registerUser = new Register({
//             firstname: req.body.firstname,
//             lastname:  req.body.lastname,
//             email:  req.body.email,
//             password:  req.body.password
//         })

//         const registered = await registerUser.save();
//         res.status(201).render("index");

//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

app.post("/login", async (req, res) => {
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = bcrypt.compare(password, useremail.password);
        
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("Password are not matching");
        }

    } catch (error) {
        res.status(400).send("Invalid Login Details");
    }
});

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})
