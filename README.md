## 背景
改造之前的项目都是本地打包，然后压缩打包之后的文件，再直接上传到服务器。考虑到安全问题，项目要流水线迁移，通过上传代码之后，在平台配置部署打包命令，一键部署到Nars磁盘上。
但根据之前的项目这是行不通的。先来详细说一下老项目的历史情况：
1. 老项目大部分是使用ExtJS写的，其中还有部分是jQuery，其性能是比较不好的。重构的第一个版本采用的是vue-cli，之前可能考虑到页面模块的独立性和复用性，每一个页面模块为一个单独的入口，但是该项目的模块又非常多，vue-cli 2.0超过五个入口无法打包，而项目中含有三四十个需要打包的模块，五六个需要直接拷贝的模块，按照之前的措施，必须要手动修改页面入口，分步骤分批次打包。
2. 负责这个项目之后，发现在@vue/cli 3.0.2 修复了这个问题，我尝试着升级之后，确实可以解决一次性打包的问题，但是打包速度相对较慢（31个页面）。
虽然打包的问题勉强解决了，但该项目打包出来的不同模块，目录结构其实是不相同的，为此打包之后，还必须要单独处理打包之后的文件格式（之前项目用的是nodejs文件来处理打包出来的文件）。@vue/cli定制化的打包配置并不能满足我们目前的要求。我们可能还需要写一个nodejs文件去处理打包之后的文件，使之变成我们所需要的目录结构。
除此之外，项目中除了需要有些模块是需要webpack打包，还有些是html文件，直接拷贝到打包的文件目录就可以的。
所以其实打包和处理文件的结构的过程还是比较混乱的，根本不可能实现自动化部署。
最终决定脱离cli的配置，根据项目特点，利用webpack4搭建一个脚手架。目前也取得了很好的效果，包括开发效率和打包效率等。
## 打包措施
* 本地运行
从`packgage.json`文件中可以看到运行`npm start`，可以在本地开启服务进行调试。本地开启服务的入口为`./build/webpack.dev.js`，开发环境的配置文件`webpack.dev.js`中，配置了一些开发环境的选项，包括：模式、入口、输出、文件解析等的loader、热更新和启动开发环境的配置选项。
* 打包
运行`package.json`中的`npm run build:dll`命令，即可开始打包。打包的入口文件为`./build/build-prod.js`，文件中定义了一些打包的动画，引入`./webpack.prod`中的配置，`./webpack.prod`中和开发环境的配置类似，也是一些模式、入口、输出、文件解析等的loader、生成html模版等的plugin。但在`./webpack.prod`中有一些优化的选项，如：CSS提取和压缩、以及optimization配置选项。下面针对具体的打包优化措施来详细讲一下。
* 优化
1. DllPlugin
在开发过程中，我们改动了代码，保存就会编译，如果能够减少编译的时间，可以极大的提升开发效率。同样的道理，在打包上线的过程中，如果能够缩短打包的时间，也是能够极大的提升效率的。
所以无论是开发还是生产环境，我们在构建前端项目的时候，往往希望可以提升打包的速率。而在现在的项目中，我们一般都是基于框架及一些第三方库的开发，如Vue、Vuex、axios等等，但第三方库又不会经常改动。如果能把这些库文件提取出来，webpack只需要打包项目本身的业务代码，而不会再去编译第三方库，那么第三方库在第一次打包的时候只打包一次，以后只要我们不升级第三方包的时候，那么webpack就不会对这些库去打包，这样就能减少打包体积，快速的提高打包的速度。为了解决上述的问题DllPlugin 和 DllReferencePlugin就产生了。
  * DllPlugin
  简单说一下DllPlugin的参数配置：
    1) context(可选)
    manifest文件中请求的上下文，默认为该webpack文件上下文。非常重要的参数，下面会说一下在这遇到的坑。
    2) name
    公开的dll函数的名称，和 output.library保持一致。
    3) path
    manifest.json 生成文件的位置和文件名称。
  这个插件需要在一个额外独立的webpack配置中创建一个bundle，即配置文件中需要有一个`webpack.dll.js`的文件，它的作用是把所有的第三方库依赖打包到一个bundle的dll文件里面，还会生成一个名为`manifest.json`文件。`manifest.json`的作用是用来让 DllReferencePlugin 映射到相关的依赖上去的。
  因为webpack支持多入口，可以在`webpack.dll.js`文件中将不同类型的第三方库放在不同的入口，详见该脚手架中的配置。
  * DllReferencePlugin
  DllPlugin 结合 DllRefrencePlugin 插件的运用，对将要产出的 bundle 文件进行拆解打包，可以很彻底地加快 webpack 的打包速度，从而在开发过程中极大地缩减构建时间。
  DllReferencePlugin参数配置：
    1) context
    manifest文件中请求的上下文。
    2) manifest
    编译时的一个用于加载JSON的manifest的绝对路径。
    3) name
    dll暴露的地方的名称(默认值为manifest.name)。
    4) scope
    dll中内容的前缀。
    5) sourceType
    dll是如何暴露的libraryTarget。
  DllReferencePlugin这个插件是在`webpack.base.js`中使用的，该插件的作用是把刚刚在webpack.dll.config.js中打包生成的dll文件引用到需要的预编译的依赖上来。如在DllPlugin打包后生成了`vue_bundle.js`和`vue_bundle.mainfest.js`文件，`vue_bundle.js`包含第三方库的代码，`vue_bundle.mainfest.js`会包含代码库的索引，当在本地或者生产使用打包使用DllReferencePlugin插件的时候，会使用该 DllReferencePlugin 插件读取 `vue_bundle.mainfest.js`文件，看看是否有该第三方库。
  所以说第一次使用 webpack.dll.config.js 文件会对第三方库打包，打包完成后就不会再打包它了，然后每次运行 `webpack.dev.js`或者`webpack.prod.js`文件的时候，都只会打包项目中本身的业务代码，当需要使用第三方依赖的时候，会使用 DllReferencePlugin 插件去读取第三方依赖库。
  这里选取了项目中39个入口模块引入DllPlugin前后的打包时间对比：
  | --- | --- | --- | --- |
  |  | 第一次（ms） | 第二次（ms） | 第三次（ms） | 第四次（ms） | 第五次（ms） | 平均（ms） | 包体积（MB）|
  | 没有引入DllPlugin  | 50610 | 38612 | 46111 | 47024 | 48923 | 41.48 |
  | 引入DllPlugin | 35460 | 32270 | 36696 | 31446 | 32583 | 11.06 |
2. happypack/thread-loader
  HappyPack 可以将原有的 webpack 对 loader 的执行过程，从单一进程的形式扩展为多进程的模式，从而加速代码构建。详细的用法可以参考脚手架中的配置。
  使用HappyPack要注意几点：
    * url-loader 支持不好，icon、图片不显示
    路径没错，icon、图片就是不显示。
    ```
    createHappyPlugin('image', [{
        loader: 'url-loader',
        options: {
            limit: 1000,
            name: fontFullPath => getResourcePath(fontFullPath)
        }
    }])
    ```
    [HappyPack with url-loader](https://github.com/amireh/happypack/issues/240)
    * vue-loader 15 不支持happyloader，采用thread-loader。但再项目中thread-loader对打包速度影响不大，可能因为其本身也有开销。
    [vue-loader@15 with happypack@5.0.0 Module build failed: CssSyntaxError](https://github.com/vuejs/vue-loader/issues/1273)
    * [Can HappyPack support MiniCssExtractPlugin](https://github.com/amireh/happypack/issues/223)
  happypack对js/ts文件的收益较大，所以在该脚手架中，只有js文件使用了happypack。
3. webpack-parallel-uglify-plugin
  webpack虽然默认提供了UglifyJS来压缩JS代码，但它使用的是单线程压缩代码，也就是说多个js文件需要被压缩，它需要一个个文件进行压缩。
  HappyPack的思想是使用多个子进程取去解析和编译JS、CSS等，这样就可以并行处理多个子任务，处理完了之后再将结果放到主进程中。借此思想，ParallelUglifyPlugin就诞生了。当webpack有多个JS文件需要输出和压缩时候，原来会使用UglifyJS去一个个压缩并且输出，但是ParallelUglifyPlugin插件则会开启多个子进程，把对多个文件压缩的工作分别给多个子进程去完成，但是每个子进程还是通过UglifyJS去压缩代码。
  我们知道编译速度的快慢受两个因素影响较大，一个是babel 等 loaders 解析阶段；另一个是JS压缩阶段。所以如果能够并行的处理压缩任务，效率会更加提高。
  | --- | --- | --- | --- |
  |  | 第一次（ms） | 第二次（ms） | 第三次（ms） | 第四次（ms） | 第五次（ms） | 平均（ms） | 包体积（MB）|
  | 仅引入DllPlugin | 35460 | 32270 | 36696 | 31446 | 32583 | 11.06 |
  | 引入DllPlugin、happypack、ParallelUglifyPlugin | 31134 | 30845 | 29524 | 30125 | 31068 | 12.99 |
4. 压缩CSS（optimize-css-assets-webpack-plugin）
  webpack4中JS自动压缩，CSS需要另外安装插件压缩。
5. 路由懒加载
  详见官方文档[路由懒加载](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)
6. cache-loader
  可以利用cache-loader缓存loader的执行结果。
  ```
    rules: [{
        test: /\.vue$/,
        use: [
          { loader: 'cache-loader' },
          { loader: 'vue-loader' }
        ],
    }]
  ```
7. optimization
  升级至webpack4之后，一些默认插件由optimization代替了：
  * CommonsChunkPlugin废弃，由optimization.splitChunks 和 optimization.runtimeChunk代替，前者拆分代码，后者提取runtime代码。原来的CommonsChunkPlugin产出模块时，会包含重复的代码，并且无法优化异步模块，minchunks的配置也较复杂，splitChunks解决了这个问题。
  * optimize.UglifyJsPlugin 废弃，由 optimization.minimize 替代，生产环境默认开启。
  optimization 的默认配置如下：
  ```
  optimization: {
    minimize: env === 'production' ? true : false, // 开发环境不压缩
    splitChunks: {
        chunks: "async", // 共有三个值可选：initial(初始模块)、async(按需加载模块)和all(全部模块)
        minSize: 30000, // 模块超过30k自动被抽离成公共模块
        minChunks: 1, // 模块被引用>=1次，便分割
        maxAsyncRequests: 5,  // 异步加载chunk的并发请求数量<=5
        maxInitialRequests: 3, // 一个入口并发加载的chunk数量<=3
        name: true, // 默认由模块名+hash命名，名称相同时多个模块将合并为1个，可以设置为function
        automaticNameDelimiter: '~', // 命名分隔符
        cacheGroups: { // 缓存组，会继承和覆盖splitChunks的配置
            default: { // 模块缓存规则，设置为false，默认缓存组将禁用
                minChunks: 2, // 模块被引用>=2次，拆分至vendors公共模块
                priority: -20, // 优先级
                reuseExistingChunk: true, // 默认使用已有的模块
            },
            vendors: {
                test: /[\\/]node_modules[\\/]/, // 表示默认拆分node_modules中的模块
                priority: -10
            }
        }
    }
  }
  ```
  如果想继续细分代码，可以使用缓存组(Cache Groups)。像再项目中，因为大部分模块都是使用的公用组件，所以设置了一个components的缓存组。
  8. 移除不必要的库
  在我们的项目中，其实很多库是没有用到的，比如vuex等等，精简不必要的模块，也能在一定程度上提升打包效率、减小打包体积。
  9. 优化模块查找路径
  webpack打包时，会有各种路径要去查询搜索，我们可以加上一些配置，让它搜索的更快，如`resolve.alias`，`exclude`等。 
最终的打包时间对比：
  | --- | --- | --- |
  | 第一次（ms） | 第二次（ms） | 第三次（ms） | 第四次（ms） | 第五次（ms） | 包体积（MB）|
  | 引入DllPlugin、happypack、ParallelUglifyPlugin | 50610 | 38612 | 46111 | 47024 | 48923 | 41.48 |
  | 最终 | 30981 | 28324 | 28799 | 26119 | 30773| 2.07 |
当然这是拿三四十个模块测试一起打包需要这么长时间，实际上一般一次发版不会改动这么多模块，一般都不会超过五个模块，打包时间一般十秒左右。
  10. 按需加载babel-polyfill
  babel-polyfill的缺点是使用之后打包体积很大，因为babel-polyfill是一个整体，把所有方法都加到原型链上。比如我们只使用了Array.from，但它把Object.defineProperty也给加上了。使用@babel/runtime和@babel/plugin-transform-runtime 用插件后，不会影响到全局环境，而且还是按需引入。
  ```
  "plugins": ["@babel/plugin-transform-runtime"]
  ```
  babel6和babel7的区别具体可查看[babel6和babel7中关 polyfill和preset-env和babel-plugin-transform-runtime等总结](https://blog.csdn.net/letterTiger/article/details/100717666)。
项目部署是通过在部署系统配置部署命令：
```
// 编译前脚本，在编译指令运行之前运行，比如前端工程的打包。
node -v
npm install
npm run build:prod
rm -rf maam_admin_h5/
mv dist/ maam_admin_h5/
zip -r maam_admin_h5.zip maam_admin_h5/
ls
```
优化前后的部署时间对比：
| --- | --- | --- |
| 触发源 | 前端代码编译 | 部署到STG |
| 4S | 45S | 13S |
| 10S | 74S | 18S |
## 遇到的问题
* Dll
  1. `process.cwd`
    `process.cwd`可参考[Node.js的__dirname，__filename，process.cwd()](https://github.com/jawil/blog/issues/18)
    一开始使用使用DllPlugin、DllReferencePlugin是有问题的，一开始的配置是：
    ```
    new webpack.DllPlugin({
        context: process.cwd(),
        name: '_dll_[name]',
        path: resolve('static/dll/[name].manifest.json'),
    })
    ```
    ```
    ...Object.keys(BuildConf.dll).map(key => {
        return new webpack.DllReferencePlugin({
            context: process.cwd(),
            manifest: require(`../static/dll/${key}.manifest.json`),
        });
    }),
    ```
    但是element UI中的table组件渲染有问题，后面在build/webpack.dll.js文件中增加了配置：
    ```
    resolve: {
        extensions: ['.js', '.vue', '.ts', '.tsx', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@': resolve('src'),
        },
    }
    ```
    就不会出现问题，因为使用了vue和element-ui，vue使用的是`vue.esm.js`，而element-ui又依赖vue，所以同时在build.congfig.js里面设置的dll配置也要注意顺序，`vue/dist/vue.esm.js`要在element-ui前面，即被依赖的要放在前面。
    ```
    dll: {
        vue_bundle: ['vue/dist/vue.esm.js', 'vue-router', 'vuex'],
        react_bundle: ['react'],
        vendors: ['axios'],
        mintUI: ['mint-ui'],
        elementUI: ['element-ui'],
    },
    ```
  2. `__dirname`
  后面又尝试了把`context`设置为`__dirname`，发现包括表格在内的组件都可以正常使用，但是打包的时候，element-ui、vue等进行了dll抽离的第三方库仍然打包进去了。后面排查到原因发现由于我们的打包配置文件不是在根目录下，context必须设置为：
  ```
  {
    context: path.join(__dirname, '..')
  }
  ```
  参考[autodll-webpack-plugin](https://github.com/asfktz/autodll-webpack-plugin)。
  再次打包发现正常了。
* 打包重复的问题
先来说一下项目的背景，本项目使用的是vue + elementUI，打包的时候采用dll提前打包第三方库，这里将第三方库分为几个部分：
  1. vue_bundle
  vue生态包，包括`vue/dist/vue.esm.js`、`vue-router`，`vuex`。
  2. react_bundle
  这里为了演示，把react也加进来了。
  3. vendors
  第三方包，包括`axios`。
  4. mintUI
  `mint-ui`UI库。
  5. elementUI
  `element-ui`UI库。
这样拆分的好处是，一来结构清晰，二来降低包大小。但是这样打包的时候发现，`vue_bundle`和`elementUI`中会包含重复的代码。探究其原因是因为`elementUI`引入了`vue_bundle`，即其内部UI库中单独引用了vue。
根据dll的原理可知，dll在打包的时候会将所有包含的库做一个索引，写在一个manifest文件中，然后在引用dll的时候只需要引用这个manifest文件即可。于是，为了解决打包重复的问题，我决定让被依赖的库先打包，然后打包`elementUI`，需要引入第三方依赖库的时候引用已经打包出来的manifest文件即可。dll的配置如下：
```
  // build.config.js
  dll: [{
    name: 'vue_bundle',
      libs: ['vue/dist/vue.esm.js', 'vue-router', 'vuex'],
  }, {
    name: 'react_bundle',
    libs: ['react']
  }, {
    name: 'vendors',
    libs: ['axios']
  }, {
    name: 'mintUI',
    libs: ['mint-ui']
  }, {
    name: 'elementUI',
    libs: ['element-ui'],
    ref: 'vue_bundle'
  }]
```
具体的打包配置文件见`webpack.dll.conf.js`，主要的思路就是根据配置中的`ref`将第三方库分类，含有`ref`的第三方库在plugin中加入`new webpack.DllReferencePlugin`配置，指向对应的依赖库的manifest文件。
按道理来说这样配置应该是可以的，但是在打包的结果中看来并没有完全剔除第三方库，改造之前的`elementUI`大小为 773 KiB，改造之后的`elementUI`仍然有 740 KiB。很奇怪。。而且这还只是考虑到一个依赖，如果有多个依赖，或者相互依赖呢，又该怎么处理？
## 总结
如果使用vue脚手架，可以较为快速的构建应用，省去了许多配置的过程。但是考虑到每个项目的情况可能会难免不能完全适用于自己的项目，自己搭建脚手架可以按照项目需要来完成所需的配置。可以根据自己的项目的实际情况来进行选择。
这个脚手架适用于多入口项目，其中模块可以含有需要打包编译的（打包出来的目录结构可以不一样），也可以处理直接拷贝到目标文件夹的模块。





