const webpack = require('webpack')

// 引入配置
const WebpackDevConf = require('./webpack.dev')

const express = require('express')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const app = express()
// const config = require('./webpack.config.js');
const compiler = webpack(WebpackDevConf)

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: WebpackDevConf.output.publicPath,
    quiet: true
  })
)

app.use(
  webpackHotMiddleware(compiler, {
    log: () => {
      console.log('热更新')
    }
  })
)

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n')
})

// 调用
// const WebpackCompiler = webpack(WebpackDevConf)

// WebpackCompiler.run((err, stats) => {
//   if (err) {
//     console.error(err)
//     return
//   }

//   console.log(
//     stats.toString({
//       chunks: false, // Makes the build much quieter
//       colors: true // Shows colors in the console
//     })
//   )
// })
