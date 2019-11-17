const path = require('path');

// 从根目录查找起
function resolve(dir) {
  return path.join(__dirname, dir);
}

/** 放到根目录的文件,如 index 索引 */
const rootProjects = ['index'];

/** 通用 module 中的配置方法 */
function generateModuleCommonConf(name) {
  return {
    entry: `src/modules/${name}/${name}.js`,
    template: `src/modules/${name}/${name}.htm`, // 这里后缀改成和 .html 不一样的
    filename: rootProjects.includes(name) ? `${name}.html` : `${name}/${name}.html`
  }
}

module.exports = {
  /**单独打包的第三方库,不改动的代码,改动需要重新 npm run build:dll */
  dll: {
    vue_bundle: ['vue/dist/vue.esm.js', 'vue-router', 'vuex'],
    react_bundle: ['react'],
    vendors: ['axios'],
    mintUI: ['mint-ui'],
    elementUI: ['element-ui'],
  },
  // dll重复打包配置
  // dll: [
  //   {
  //     name: 'vue_bundle',
  //     libs: ['vue/dist/vue.esm.js', 'vue-router', 'vuex'],
  //   }, {
  //     name: 'react_bundle',
  //     libs: ['react']
  //   }, {
  //     name: 'vendors',
  //     libs: ['axios']
  //   }, {
  //     name: 'mintUI',
  //     libs: ['mint-ui']
  //   },
  //   {
  //     name: 'elementUI',
  //     libs: ['element-ui'],
  //     ref: 'vue_bundle'
  //   }
  // ],
  /** 抽离自定义可能经常改动的公用代码 => 生成配置对应到 webpack 的 optimization. */
  libs: {
    default: false, // 禁用默认配置
    vendors: false,

    vendor: {
      name: "libs/vendor", // 抽取的chunk的名字
      test: /[\\/]node_modules[\\/]/, // 可以为字符串，正则表达式，函数。可自定义拓展你的规则，以module为维度进行抽取，只要是满足条件的module都会被抽取到该common的chunk中
      chunks: "all",
      priority: 10, // 首先: 打包node_modules中的文件。 优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中
      reuseExistingChunk: true
    },
    components: {
      name: "libs/components",
      test: resolve('src/components'),
      minChunks: 2, // 最小共用次数
      priority: 5, // 其次: 打包业务中公共代码
      reuseExistingChunk: true
    },
    api: {
      name: 'libs/api',
      test: resolve('src/api'), // 可自定义拓展你的规则
      minChunks: 1, // 最小共用次数
      priority: 0,
      minSize: 1, // 在尺寸大于 minSize 时才会拆包
      reuseExistingChunk: true, // 如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
    },
  },

  /** 所有项目相关配置 */
  config: {
    // 默认主页
    /**
     * @entry {String} webpack 入口文件
     * @template {String} 模板路径
     * @filename {String} 打包之后模板的输出文件夹
     */
    index: {
      ...generateModuleCommonConf('index'),
      chunks: ['libs/services'],
      dependencies: [
        `vue_bundle`,
        `react_bundle`,
        `vendors`,
        `mintUI`,
        `elementUI`
      ]
    },
    // 测试子项目
    'sub-project': {
      ...generateModuleCommonConf('sub-project'),
      chunks: ['libs/services'],
      dependencies: [
        `vue_bundle`,
        `react_bundle`,
        `vendors`,
        `mintUI`,
        `elementUI`
      ]
    },
    'ts-project': {
      ...generateModuleCommonConf('ts-project'),
      chunks: ['libs/services'],
      dependencies: [
        `vue_bundle`,
        `react_bundle`,
        `vendors`,
        `mintUI`,
        `elementUI`
      ]
    },
    // 静态资源配置示例

    // 根目录下静态资源拷贝
     static: {
      from: 'static',
      to: 'static',
    },
  },


  /** 是否需要重新npm install 安装依赖 */
  reNpmInstall: false,

  /** 是否需要需要可视化分析*/
  bundleAnalyzerReport: true,

  /** 静态资源打包,只需复制到目标文件夹即可 */
  staticProjects: [
    // 'static',
    // static-project
  ],

  /** 本地需要启动的服务 */
  devProjects: [
    'index',
    'sub-project',
    'ts-project'
  ],
  /** 当前需要打包的项, 'all' 或者需要打包的数组 */
  nowNeedBuild: ['index', 'sub-project', 'ts-project'],
  // nowNeedBuild: 'all',
}