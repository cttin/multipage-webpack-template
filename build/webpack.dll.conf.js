/*
 * dll打包后，elementUI中含有重复的vue的dist代码，此文件用于解决重复打包问题
*/

const webpack = require('webpack');
const buildConf = require('../build.config');
const { resolve } = require('./utils');

// 生成dll打包配置
const gen = function (vendors) {
  return vendors.map(item => {
    const base = {
      mode: 'production',
      entry: {
        [item.name]: item.libs
      },
      output: {
        path: resolve('static/dll'), // 输出的文件放到'static/dll'目录下面
        filename: `[name].js`,
        library: '_dll_[name]' // 存放相关的dll文件的全局变量名称，比如对于elementUI来说的话就是 _dll_elementUI, 在前面加 _dll是为了防止全局变量冲突。
      },
      plugins: [
        new webpack.DllPlugin({
          context: process.cwd(),
          name: '_dll_[name]', // 和output.library保持一致
          path: resolve('/static/dll/[name].manifest.json')
        }),
      ]
    };
    if(item.ref) {
      base.plugins.push(
        new webpack.DllReferencePlugin({
          context: process.cwd(),
          manifest: require(`../static/dll/${item.ref}.manifest.json`)
        })
      )
    }
    return base;
  })
};

// 根据是否有ref依赖，区分base config和ref config
const [baseVendors, refVendors] = buildConf.dll.reduce((config, v) => {
  config[v.ref ? 1 : 0].push(v); // 有ref属性就放到refVendors数组里面，没有就放到baseVendors数组里
  return config;
}, [
  [],
  []
]);

const getConfig = function() {
  return gen(baseVendors);
};

const getRefConfig = function() {
  return gen(refVendors);
};

module.exports = {
  getConfig,
  getRefConfig
}