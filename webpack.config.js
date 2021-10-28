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
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "216.193.175.49",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
        }
    },
    mode: 'production',//'development',
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
  //   optimization: {
  //    moduleIds: 'deterministic',
  //     runtimeChunk: 'single',
  //     splitChunks: {
  //       cacheGroups: {
  //         vendor: {
  //           test: /[\\/]node_modules[\\/]/,
  //           name: 'vendors',
  //           chunks: 'all',
  //         },
  //       },
  //     },
  // },
  optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'all',
    maxInitialRequests: Infinity,
    minSize: 0,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name(module) {
          // get the name. E.g. node_modules/packageName/not/this/part.js
          // or node_modules/packageName
          const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

          // npm package names are URL-safe, but some servers don't like @ symbols
          return `npm.${packageName.replace('@', '')}`;
        },
      },
    },
  },
},
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Caching',
        template: 'template.html',
        filename: '../index.html',
      })
    ],

};
