const mix = require('laravel-mix');

mix.js('./index.js', 'dist/index.js').vue();

mix.webpackConfig({
    output: {
        libraryTarget: 'umd',
    }
});