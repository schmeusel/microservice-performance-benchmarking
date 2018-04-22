const path = require('path');

module.exports = {
    entry: './src/webServer/public/index.js',
    output: {
        path: path.resolve(__dirname, 'build/webServer/public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /dist/],
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};
