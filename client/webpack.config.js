const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (_, argv) => {
  const isProd = argv.mode === 'production'

  const config = {
    entry: './src/app.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
        },
      ],
    },
    mode: isProd ? 'production' : 'development',
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        path: require.resolve('path-browserify'),
      },
    },
    output: {
      libraryTarget: 'umd',
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    optimization: isProd
      ? {
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )[1]
                  return `npm.${packageName.replace('@', '')}`
                },
              },
            },
          },
        }
      : {},
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Caching',
        template: 'template.html',
        filename: '../index.html',
      }),
    ],
  }

  if (!isProd) {
    config.devServer = {
      headers: {
        'Access-Control-Allow-Origin': '216.193.175.49',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
    }
  }

  return config
}
