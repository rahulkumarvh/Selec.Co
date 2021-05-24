require('dotenv').config()
let mix = require('laravel-mix');

mix.js('templates/js/client.js', 'public/js/client.js').js('templates/js/admin.js', 'public/js/admin.js').sass('templates/scss/client.scss', 'public/css/client.css');

