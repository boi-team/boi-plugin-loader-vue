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
    plugins: null
};
module.exports = new boli.PluginLoader('extend', options);
