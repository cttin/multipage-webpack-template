const webpack = require('webpack');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // CSS提取，生产模式
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css，webpack4 js自动压缩
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'); // 开启多个子进程，把对多个文件压缩的工作分别给多个子进程去完成，但是每个子进程还是通过UglifyJS去压缩代码

const webpackBaseConf = require('./webpack.base');

const buildConf = require('../build.config');
const { resolve, generateEntry, generateHtmlPluginArr } = require('./utils');

if(buildConf.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackBaseConf.plugins.push(new BundleAnalyzerPlugin());
}

const ENV = 'production';

module.exports = merge(webpackBaseConf, {
  context: resolve(''),
  mode: ENV,
  entry: {
    ...generateEntry(ENV)
  },
  output: {
    filename: function({ chunk, hash }) {
      let { name } = chunk;
      let hash7 = hash.substring(0, 7);
      return `${name}/${name}.${hash7}.js`
    },
    path: resolve('dist'),
    chunkFilename: `[name].[chunkhash:7].js`, // 没有指定输出名的文件输出的文件名或者可以理解为非入口文件的文件名，而又需要被打包出来的文件命名配置，如按需加载的模块
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.stylus$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    ...generateHtmlPluginArr(ENV),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(ENV)
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]/assets/css/[name].[chunkhash:8].css', // 打包的css路径
      chunkFilename: '[name].[chunkhash:8].css', // 打包的chunk中的css路径，不写的话会依据filename的路径
      ignoreOrder: false,
    }),
    new OptimizeCssAssetsPlugin(),
    new ParallelUglifyPlugin({
      uglifyJS: {},
      test: /.js$/g,
      include: [],
      exclude: [],
      cacheDir: '',
      workerCount: '',
      sourceMap: false
      // cacheDir: '.cache/',
      // uglifyJS: {
      //     output: {
      //       beautify: false, // 是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
      //       comments: false // 是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
      //     },
      //     compress: {
      //       drop_console: true, // 是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
      //       collapse_vars: true, // 是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不转换，为了达到更好的压缩效果，可以设置为false
      //       reduce_vars: true // 是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx' 转换成 var a = 'xxxx'; x = a; y = a;
      //     },
      //     warnings: false, // 注意要放到最外层，不然会报错。是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用不大的警告
      // },
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 1, // 被引用次数
      cacheGroups: { //设置缓存组用来抽取满足不同规则的chunk
        ...buildConf.libs,
      },
    },
    // runtimeChunk: true
  }
})