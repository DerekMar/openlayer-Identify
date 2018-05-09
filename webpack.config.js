const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        watchContentBase: true,
        port: 8088
    },
    entry:{
        bundle : path.join(__dirname, "src/index.js"),
        ol_Identify: path.join(__dirname, "src/js/Component/Identify/ol-Identify.js")
    },
    output:{
        path: path.join(__dirname, "dist"),
        publicPath: './',
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    resolve: {
        // 当你reuire时，不需要加上以下扩展名
        extensions: ['.js', '.md', '.txt'],
    },
    module:{
        rules:[
            {
                test: /.js$/,
                use: ['babel-loader']
            },
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
            },/*解析css, 并把css添加到html的style标签里*/
            {
                test: /.(jpg|png|gif|svg)$/,
                use: ['url-loader?limit=8192&name=./[name].[ext]']
            },/*解析图片*/
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }],
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, 'html/index.html')
        })
    ]

}