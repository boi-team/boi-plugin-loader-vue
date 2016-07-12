'use strict'

let path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(options) {
    let stylename = options && options.style && options.style.destDir ? (options.style.destDir + (options.style.useHash ? '/[name].[contenthash:8].css' : '/[name].css')) : 'style/[name].[contenthash:8].css';
    let stylePlugin = new ExtractTextPlugin(stylename);

    let cssLoaders = function(opts) {
        let options = opts || {};
        // generate loader string to be used with extract text plugin
        function generateLoaders(loaders) {
            let sourceLoader = loaders.map(function(loader) {
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
            css: generateLoaders(['css']),
            postcss: generateLoaders(['css']),
            less: generateLoaders(['css', 'less']),
            sass: generateLoaders(['css', 'sass?indentedSyntax']),
            scss: generateLoaders(['css', 'sass']),
            stylus: generateLoaders(['css', 'stylus']),
            styl: generateLoaders(['css', 'stylus'])
        }
    }

    // Generate loaders for standalone style files (outside of .vue)
    let styleLoaders = function(options) {
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

    let ClassLoader = boi.PluginClass.loader;

    let config = {
        module: {
            preloader: null,
            postloader: null,
            loaders: [{
                test: /\.vue$/,
                loader: 'vue'
            }].concat(styleLoaders({
                extract: true
            }))
        },
        noParse: null,
        plugins: [stylePlugin],
        extra: {
            vue: {
                loaders: cssLoaders({
                    extract: true
                })
            }
        },
        // 插件依赖的第三方module
        // 此配置项是为了解决低版本npm树形安装node_modules引起的module寻址问题
        // 如果你确定使用npm 3.0.0及以上版本，可以不配置此项
        dependencies: [
            'vue-loader',
            'vue-style-loader',
            'vue-html-loader',
            'extract-text-webpack-plugin'
        ]
    };

    // 每个插件中创建实例的数量不限,但是建议每个loader插件只创建一个实例
    new ClassLoader('extend', config);
}
