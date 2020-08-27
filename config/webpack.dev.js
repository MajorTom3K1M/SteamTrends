const helpers = require('./helpers');
const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
    devtool: 'eval-source-map',

    mode: 'development',

    entry: {
        'app': [
            'webpack-hot-middleware/client?reload=true'
        ]
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            }
        ]
    },

    output: {
        filename: 'js/[name].js',
        chunkFilename: '[id].chunk.js'
    },

    devServer: {
        contentBase: helpers.root('client/public'),
        historyApiFallback: true,
        stats: 'minimal' // none (or false), errors-only, minimal, normal (or true) and verbose
    }
});