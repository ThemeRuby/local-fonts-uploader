const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  entry: './admin/src/js/main.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'admin/assets')
  },
  module: {
    rules: [
      {
        test: /\.(woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.(eot|ttf|woff)$/,
        exclude: [path.resolve(__dirname, 'node_modules/@mdi/font')],
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [replaceFontface()]
              }
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [replaceFontface()]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].min.css'
    })
  ],
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  mode: 'development'
}

/**
 * This function is used to change the font-face in Vuetify css,
 * avoiding the loading of .ttf, .eot, and .woff files,
 * and instead only loading .woff2 to optimize font size.
 */
function replaceFontface() {
  return {
    postcssPlugin: 'postcss-replace-fontface',
    Once(root, { result }) {
      root.walkAtRules('font-face', (fontFace) => {
        fontFace.nodes = fontFace.nodes.filter((node) => node.prop !== 'src')

        fontFace.append({
          prop: 'src',
          value:
            'url(../fonts/materialdesignicons-webfont.woff2) format("woff2")'
        })
      })
    }
  }
}
replaceFontface.postcss = true
