const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/webServer/public/index.js',
    output: {
        path: path.resolve(__dirname, 'build/webServer/public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: [/node_modules/, /dist/, /build/],
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};
