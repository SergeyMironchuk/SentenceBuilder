const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
    mode: 'production',
    entry: './app/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'app')
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ]
};