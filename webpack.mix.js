let mix = require('laravel-mix');

mix.js('templates/js/client.js', 'public/js/client.js').sass('templates/scss/client.scss', 'public/css/client.css');

