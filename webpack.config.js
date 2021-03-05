const path = require('path');
module.exports = {
    entry: './src/app.ts',
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader'
        }
        ]
    },
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "216.193.175.49",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
        }
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
        alias: {
            path: require.resolve("path-browserify")
        }
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development'
};
