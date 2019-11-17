const path = require('path');

const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const {
  resolve,
  generateCopyStaticArr,
  createHappyPlugin,
  loaderIncludePaths
} = require('./utils');

const rootPath = __dirname.replace('build', '');

const BuildConf = require('../build.config');


// 获取图片字体等资源的打包和引用路径
function getResourcePath(resourceFullPath) {
  let fileDictoryPathArr = resourceFullPath.split('/');
  fileDictoryPathArr.pop();
  let fileDictoryPath = fileDictoryPathArr
      .join('/')
      .replace('src/modules/', '')
      .replace('node_modules/element-ui/lib/theme-chalk/', '')
      .replace(rootPath, '');
  // console.log('资源打包放置路径:', fileDictoryPath);
  return path.posix.join(fileDictoryPath, '[name].[hash:7].[ext]');
}

module.exports = {
  resolve: {
    extensions: ['.js', '.vue', '.ts', 'tsx', 'json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          { loader: 'cache-loader' },
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1,
            }
          },
          { loader: 'vue-loader' } // vuew-loader15 不支持happyloader
        ],
        exclude: /node_modules/,
        include: loaderIncludePaths
      },
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'cache-loader' },
          // {
          //   loader: 'thread-loader', // 有问题
          //   options: {
          //     workers: require('os').cpus().length - 1,
          //   }
          // },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/,
        include: loaderIncludePaths,
      },
      {
        test: /\.js$/,
        // loader: 'babel-loader',
        use: ['happypack/loader?id=babel'], // 将对.js文件的处理转交给id为babel的HappyPack的实列
        exclude: /node_modules/,
        include: loaderIncludePaths
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader', //  happy对url-loader支持不友好
        options: {
          limit: 1000,
          name: 'images/[name].[ext]',
          exclude: /node_modules/,
          include: loaderIncludePaths
          // name: imgFullPath => getResourcePath(imgFullPath),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
          name: 'images/[name].[ext]',
          exclude: /node_modules/,
          include: loaderIncludePaths
          // name: fontFullPath => getResourcePath(fontFullPath),
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([...generateCopyStaticArr()]),
    // 第三方库 dll 配置
    ...Object.keys(BuildConf.dll).map(key => { // 告诉webpack使用了哪些第三方库
      return new webpack.DllReferencePlugin({
        // context: process.cwd(),
        context: __dirname,
        manifest: require(`../static/dll/${key}.manifest.json`), // 把相应的第三方库映射到json文件
      })
    }),
    // dll重复打包配置
    // ...BuildConf.dll.map(item => {
    //   return new webpack.DllReferencePlugin({
    //     context: __dirname,
    //     manifest: require(`../static/dll/${item.name}.manifest.json`)
    //   })
    // }),
    createHappyPlugin('babel', [
      'babel-loader'
    ])
    // 将 dll 注入到 生成的 html 模板中
    // new AddAssetHtmlPlugin({
    //   filePath: resolve('static/dll/*.js'), // dll文件位置
    //   outputPath: './static/dll', // dll 最终输出的目录
    //   publicPath: './static/dll', // dll 引用路径
    // })
    // new AutoDllPlugin({
    //   inject: true,
    //   filename: '[name]_[hash].dll.js',
    //   path: './static/dll',
    //   entry: {
    //     vue_bundle: ['vue/dist/vue.esm.js', 'vue-router', 'vuex'],
    //     react_bundle: ['react'],
    //     vendors: ['axios'],
    //     mintUI: ['mint-ui'],
    //     elementUI: ['element-ui']
    //   }
    // })
  ]
}