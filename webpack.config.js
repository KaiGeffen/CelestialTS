const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');


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
    // devServer: {
    //     headers: {
    //         "Access-Control-Allow-Origin": "216.193.175.49",
    //         "Access-Control-Allow-Methods": "*",
    //         "Access-Control-Allow-Headers": "*"
    //     }
    // },
    mode: 'production',
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
        alias: {
            path: require.resolve("path-browserify")
        }
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    optimization: {
     moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
  },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Caching',
        template: 'template.html',
        filename: '../index.html',
      }),
    ],
};
