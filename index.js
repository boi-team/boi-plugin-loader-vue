'use strict'

require('shelljs/global');
const _ = require('lodash');
const Path = require('path');
const Glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ClassLoader = boi.PluginClass.loader;

const DEFAULT_OPTIONS = {
  style: {
    output: 'style',
    useHash: true,
    extract: false,
    autoprefixer: false
  }
}
module.exports = function (opts) {
  const ENV = process.env.BOI_ENV;

  let globalOpts = Object.assign({}, DEFAULT_OPTIONS);

  if (opts) {
    let _keys = Object.keys(opts);
    if (_keys.indexOf(ENV) === -1) {
      // 如果配置项中无环境特定配置，则直接赋值
      globalOpts = Object.assign({}, globalOpts, opts);
    } else {
      _keys.forEach((key) => {
        // 区分配置项是特定env生效还是共用
        if (key === ENV) {
          globalOpts = Object.assign({}, globalOpts, opts[key]);
        } else {
          // 屏蔽非当前环境的配置项
          globalOpts = Object.assign({}, globalOpts, {
            [key]: opts[key]
          });
        }
      });
    }
  }


  const CssFilename = Path.posix.join(globalOpts.style.output, (ENV!=='dev'&&globalOpts.style
    .useHash ? '[name].[contenthash:8].css' : '[name].css'));
  const ExtractPlugin = new ExtractTextPlugin({
    filename: CssFilename
  });

  function GetLoaders() {
    let baseLoaders = [];
    let cssLoaderOptions = {
      url: true,
      minimize: true
    };
    // 开发环境不压缩
    if (process.env.BOI_ENV === ENV.development) {
      cssLoaderOptions.minimize = false;
    }
    baseLoaders.push({
      loader: 'css-loader',
      options: cssLoaderOptions
    });
    if (globalOpts.style.autoprefixer) {
      baseLoaders.push({
        loader: 'postcss-loader',
        options: {
          plugins: [require('autoprefixer')]
        }
      });
    }

    return {
      css: globalOpts.style.extract ? ExtractTextPlugin.extract({
        use: baseLoaders,
        fallback: 'vue-style-loader'
      }) : [{
        loader: 'vue-style-loader'
      }].concat(baseLoaders),
      less: globalOpts.style.extract ? ExtractTextPlugin.extract({
        use: baseLoaders.concat(['less-loader']),
        fallback: 'vue-style-loader'
      }) : [{
        loader: 'vue-style-loader'
      }].concat(baseLoaders).concat(['less-loader']),
      scss: globalOpts.style.extract ? ExtractTextPlugin.extract({
        use: baseLoaders.concat(['sass-loader']),
        fallback: 'vue-style-loader'
      }) : [{
        loader: 'vue-style-loader'
      }].concat(baseLoaders).concat(['sass-loader'])
    };
  };

  // 每个插件中创建实例的数量不限,但是建议每个loader插件只创建一个实例
  new ClassLoader('external', {
    module: {
      rules: [{
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            loaders: GetLoaders()
          }
        }]
      }]
    },
    plugins: globalOpts.style.extract?[ExtractPlugin]:[]
  });
}
