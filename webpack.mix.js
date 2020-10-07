const mix = require('laravel-mix');

mix.js('./index.js', 'dist/index.js');

mix.webpackConfig({
    output: {
        libraryTarget: 'umd',
    }
});