'use strict'

let ClassLoader = boi.PluginClass.loader;

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
    // 插件依赖的第三方module
    // 此配置项是为了解决低版本npm树形安装node_modules引起的module寻址问题
    // 如果你确定使用npm 3.0.0及以上版本，可以不配置此项
    dependencies: [
        'vue-loader'
    ]
};

// 每个插件中创建实例的数量不限,但是建议每个loader插件只创建一个实例
new ClassLoader('extend', options);
