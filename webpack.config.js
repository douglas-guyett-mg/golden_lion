// webpack.config.js
var webpack = require('webpack')
module.exports = {
    entry: {
        entry: __dirname + '/moonlight_components/src/lib/components/replacement.js'
    },
    output: {
        filename: '[name].bundle.js',
        library: 'myLibrary'
    },
    module: {
        rules: [
            {
               test: /\.jsx?$/,
               exclude: /node_modules/,
               loader: 'babel-loader',
               options: {
                  presets: ["@babel/preset-env"]
               }
            }
        ]
    }
}