'use strict'

let options = {
    module: {
        preloader: null,
        postloader: null,
        loader: {
            test: /\.vue$/,
            loader: 'vue',
            query: null
        }
    },
    noParse: null,
    plugins: null,
    // 插件依赖的module
    // 此配置项是为了解决低版本npm树形安装node_modules引起的module寻址问题
    // 如果你确定使用npm 3.0.0及以上版本，可以不配置此项
    dependencies: [
        'vue-loader'
    ]
};
module.exports = new boi.PluginLoader('extend', options);
