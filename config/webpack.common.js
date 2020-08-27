const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const helpers = require('./helpers');

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';

module.exports = {
    entry: {
        'app': [
            helpers.root('client/app/main.js')
        ]
    },

    output: {
        path: helpers.root('dist'),
        publicPath: '/'
    },

    resolve: {
        extensions: [".vue", ".js", ".json"],
        mainFiles: ["index"],
        alias: {
            "images": helpers.root('client/app/images'),
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"]
            },
            // ES6/7 syntax and JSX transpiling out of the box
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /vendor/]
            },
            // Image files
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
            // required for font-awesome icons
            {
                test: /\.(woff2?|svg)$/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    prefix: "font/"
                }
            },
            {
                test: /\.(ttf|eot)$/,
                loader: "file-loader",
                options: {
                    prefix: "font/"
                }
            }
        ]
    },

    plugins: [
        new VueLoaderPlugin(),

        new webpack.HotModuleReplacementPlugin(),
        // new ExtractTextPlugin({
        //     filename: 'css/[name].[hash].css',
        //     disable: !isProd
        // }),

        new HtmlWebpackPlugin({
            template: helpers.root('client/public/index.html'),
            inject: 'body'
        }),
    ]
}