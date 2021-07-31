const path = require('path')
const crypto = require('crypto')

// Function to hash a string
hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)

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
        filename: 'app.js',//' + hashCode(Date.now.toString()) + '
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development'
};
