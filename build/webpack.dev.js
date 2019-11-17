const webpack = require('webpack');
const merge = require('webpack-merge');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const { resolve, generateEntry, generateHtmlPluginArr, createNotifierCallback } = require('./utils');


const WebpackBaseConf = require('./webpack.base');

const ENV = 'development';

module.exports = merge(WebpackBaseConf, {
  mode: ENV,
  entry: generateEntry(ENV),
  output: {
    filename: '[name].js',
    path: resolve('dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.stylus$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'stylus-loader']
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    ...generateHtmlPluginArr(ENV),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(ENV)
    }),
    new FriendlyErrorsWebpackPlugin({
      // 清除控制台原有的信息
      clearConsole: true,
      // 打包成功之后在控制台给予开发者的提示
      compilationSuccessInfo: {
          // messages: [`开发环境启动成功，项目运行在: http://0.0.0.0:8080`]
          messages: [`开发环境启动成功，项目运行在: localhost:8080`]
      },
      // 打包发生错误的时候
      onErrors: createNotifierCallback()
    }),
    // new HtmlWebpackTagsPlugin({
    //   tags: getDllAssets(ENV),
    //   append: true
    // })
  ],
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true, // 是否开启热加载替换
    compress: true,
    host: 'localhost', // 设置为localhost时，不能用本地ip访问
    port: 8080,
    open: true, // 是否自动浏览器打开
    quiet: true // 删除打印的初始化信息
  }
})