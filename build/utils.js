const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

// 读取配置文件
const buildConf = require('../build.config');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

function getModules(env) {
  let modules = env === 'development' ?
    buildConf.devProjects :
    (buildConf.nowNeedBuild === 'all' ? Object.keys(buildConf.config).filter(key => !buildConf.config[key].to) : buildConf.nowNeedBuild);
  return modules;
}

/**
 * 生成 webpack 入口对象
 * @param {string} env 配置的环境, development 开发, production 生产
 */
function generateEntry(env) {
  let entrys = {};
  let modules = getModules(env);
  modules.forEach(key => {
    Object.assign(entrys, {
      [key]: resolve(buildConf.config[key].entry)
    });
  });
  return entrys;
}

function generateHtmlPluginArr(env) {
  let modules = getModules(env);
  return modules.map(key => {
    let { template, filename, dependencies, chunks } = buildConf.config[key];
    return new HtmlWebpackPlugin({
      filename,
      template: resolve(template),
      inject: true,
      chunks: [key, ...(env === 'production' && chunks ? chunks : [])],
      dll: dependencies
    });
  })
}

// function generateTagsDllAssets() {
//   const dependencies = Object.keys(buildConf.dll);
//   const tags =  dependencies.map(dll => `static/dll/${dll}.js`)
//   return new HtmlWebpackTagsPlugin({
//     tags: tags,
//     append: true
//   })
// }

function generateCopyStaticArr() {
  return buildConf.staticProjects.map(key => {
    let { from, to, ignore = ['.*'] } = buildConf.config[key];
    return {
      to,
      ignore,
      from: resolve(from)
    }
  })
}

function createHappyPlugin(id, loaders) {
  return new HappyPack({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    verbose: true
  })
}

function createNotifierCallback() {
  return (severity, errors) => {
    if (severity !== 'error') return;
    const error = errors[0];
    const filename = error.file && error.file.split('!').pop();
    notifier.notify({
        title: packageConfig.name,
        message: severity + ': ' + error.name,
        subtitle: filename || ''
    });
  }
}

const loaderIncludePaths = [resolve('src'), resolve('test')];

module.exports = {
  resolve,
  generateEntry,
  generateHtmlPluginArr,
  generateCopyStaticArr,
  createHappyPlugin,
  createNotifierCallback,
  loaderIncludePaths
}