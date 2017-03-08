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
    useHash: true
  },
  autoprefixer: true,
  // sprites: {
  //   ext: ['jpg', 'png', 'gif'],
  //   // 散列图片目录
  //   source: 'icons',
  //   // 是否根据子目录分别编译输出
  //   split: true,
  //   // 是否识别retina命名标识
  //   retina: true,
  //   // 自行配置postcss-sprite编译配置
  //   // @see https://github.com/2createStudio/postcss-sprites
  //   postcssSpritesOpts: null
  // }
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

  // Copy .babelrc to project folder
  let babelrc = Glob.sync(Path.join(process.cwd(), '.babelrc'));
  if (!babelrc || babelrc.length === 0) {
    cp(Path.join(__dirname, '.babelrc'), Path.join(process.cwd()));
  }

  let stylename = Path.posix.join(globalOpts.style.output, (globalOpts.style.useHash ?
    '[name].[contenthash:8].css' : '[name].css'));
  let stylePlugin = new ExtractTextPlugin(stylename);
  let isAutoprefixer = globalOpts.autoprefixer;
  let baseLoaders = isAutoprefixer ? ['css'] : ['css?-autoprefixer'];
  let extras = null;

  let cssLoaders = function (opts) {
    let options = opts || {};
    // generate loader string to be used with extract text plugin
    function generateLoaders(loaders) {
      let sourceLoader = loaders.map(function (loader) {
        let extraParamChar;
        if (/\?/.test(loader)) {
          loader = loader.replace(/\?/, '-loader?');
          extraParamChar = '&';
        } else {
          loader = loader + '-loader';
          extraParamChar = '?';
        }
        return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
      }).join('!')

      if (options.extract) {
        return stylePlugin.extract('vue-style-loader', sourceLoader);
      } else {
        return ['vue-style-loader', sourceLoader].join('!');
      }
    }
    // http://vuejs.github.io/vue-loader/configurations/extract-css.html
    return {
      css: generateLoaders(baseLoaders),
      postcss: generateLoaders(baseLoaders),
      less: generateLoaders(baseLoaders.concat(['less'])),
      sass: generateLoaders(baseLoaders.concat(['sass?indentedSyntax'])),
      scss: generateLoaders(baseLoaders.concat(['sass'])),
      stylus: generateLoaders(baseLoaders.concat(['stylus'])),
      styl: generateLoaders(baseLoaders.concat(['stylus']))
    };
  }

  // Generate loaders for standalone style files (outside of .vue)
  let styleLoaders = function (options) {
    let output = [];
    let loaders = cssLoaders(options);
    for (let extension in loaders) {
      let loader = loaders[extension];
      output.push({
        test: new RegExp('\\.' + extension + '$'),
        loader: loader
      });
    }
    return output;
  }

  let config = {
    module: {
      preloader: null,
      postloader: null,
      loaders: [{
        test: /\.vue$/,
        loader: 'vue'
      }]
    },
    noParse: null,
    // plugins: [stylePlugin],
    extra: Object.assign({}, extras, {
      vue: {
        autoprefixer: isAutoprefixer,
        loaders: cssLoaders({
          extract: false
        }),
        exclude: /node_modules/
      },
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.common.js'
        }
      }
    })
  };
  // 每个插件中创建实例的数量不限,但是建议每个loader插件只创建一个实例
  new ClassLoader('extend', config);
}
