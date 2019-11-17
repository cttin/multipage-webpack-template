const webpack = require('webpack');

const { resolve } = require('./utils');

const buildConf = require('../build.config');

module.exports = {
  mode: 'production',
  entry: {
    ...(buildConf.dll || {}) // 项目中用到的依赖库
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts', '.tsx', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  output: {
    path: resolve('static/dll'), // 输出的文件放到'static/dll'目录下面
    filename: `[name].js`,
    library: '_dll_[name]' // 存放相关的dll文件的全局变量名称，比如对于elementUI来说的话就是 _dll_elementUI, 在前面加 _dll是为了防止全局变量冲突。
  },
  plugins: [
    new webpack.DllPlugin({
      // context: process.cwd(), // 总是返回运行 node 命令时所在的文件夹的绝对路径
      context: __dirname, // 总是返回被执行的 js 所在文件夹的绝对路径
      name: '_dll_[name]', // 需要和 output.library 保持一致，该字段值，也就是输出的 manifest.json 文件中 name 字段的值。
      path: resolve('/static/dll/[name].manifest.json') // 生成 manifest 文件输出的位置和文件名称
    })
  ],
  // optimization: {
  //   splitChunks: {
  //     chunks: "all",
  //     name: "split"
  //   }
  // }
}


/*
 *--------------------
 * dll打包后，elementUI中含有重复的vue的dist代码，此部分用于解决重复打包问题
 * package.json配置
 * "build:dll": "node ./build/webpack.dll.js",
*/
// const webpack = require('webpack');
// const dllConfig = require('./webpack.dll.conf');

// const runWebpack = function (config) {
//   const result = config.map(dll => {
//     return new Promise((resolve, reject) => {
//       webpack(dll, (err, stats) => {
//         process.stdout.write(stats.toString({
//           colors: true,
//           modules: false,
//           children: false,
//           chunks: false,
//           chunkModules: false
//       }))
//         if(err) throw err;
//         resolve();
//       })
//     })
//   })
//   return result;
// };

// function run() {
//   Promise.all(runWebpack(dllConfig.getConfig()))
//   .then(() => runWebpack(dllConfig.getRefConfig()))
//   .catch(err => {
//     throw new Error(err.message);
//   })
// }

// run();

