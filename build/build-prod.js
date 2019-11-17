const exec = require('child_process').exec;

const ora = require('ora'); // node.js命令行环境的loading效果
const chalk = require('chalk'); // 优雅地输出带颜色的文本

const buildConfig = require('../build.config');

const spinner = ora(`building for production environment...`);

spinner.start();

// 检测是否需要重新安装依赖
if(buildConfig.reNpmInstall) {
  // logStepActionTitle('执行重新安装依赖 npm install')
  exec(`npm install`, function(err, stdout, stderr) {
    if(err) {
      console.log(stderr);
    }else {
      console.log(stdout);
      runWebpackBuild();
    }
  })
}else {
  runWebpackBuild();
}

// webpack 打包编译
function runWebpackBuild() {
  const webpack = require('webpack');
  // 引入配置
  const webpackProdConf = require('./webpack.prod');
  const compiler = webpack(webpackProdConf);
  compiler.run((err, stats) => {
    spinner.stop();
    if(err) {
      console.log(err);
    }
    process.stdout.write(
      stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n'
    );

    if(stats.hasErrors()) {
      console.log(chalk.red('(ﾟДﾟ≡ﾟдﾟ)!? Build failed with errors.\n'));
      process.exit(1);
    }
    console.log(chalk.cyan('Build complete.\n'));
  })
}