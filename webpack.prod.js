const path = require('path');


const WebappWebpackPlugin = require('webapp-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //installed via npm
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');


const buildPath = path.resolve(__dirname, 'dist');

module.exports = {
  devtool: 'source-map',
  // compile the code in our entry point src/index.js and output a bundle in /dist/bundle.js
  entry: './src/index.js',
  // add an hash to the bundle and put into the dist folder
  output: {
    filename: '[name].[hash:20].js',
    path: buildPath
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        // regex to run the loader on all files ending with .js only
        test: /\.js$/,
        // we don't want to run the loader on node_modules contents
        exclude: /node_modules/,
        use: {
          // specifying to use babel-loader
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(scss|css|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            // translates CSS into CommonJS
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            // Runs compiled CSS through postcss for vendor prefixing
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          {
            // compiles Sass to CSS
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded',
              sourceMap: true,
              sourceMapContents: true
            }
          }
        ]
      },
      {
        // Load all images as base64 encoding if they are smaller than 8192 bytes
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash:20].[ext]',
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  // this is how plugins are used
  plugins: [
    new HtmlWebpackPlugin({
      // the HTML5 template to use
      template: './index.html',
      // Inject the js bundle at the end of the body of the given template
      inject: 'body',
    }),
    // A webpack plugin to remove/clean your build folder(s) before building
    new CleanWebpackPlugin(buildPath),
    new WebappWebpackPlugin({
      // Your source logo (required)
      logo: './src/assets/png/logo.png',
      // Enable caching and optionally specify the path to store cached data
      // Note: disabling caching may increase build times considerably
      cache: true,
      // Prefix path for generated assets
      prefix: 'assets/logos/',
      // Inject html links/metadata (requires html-webpack-plugin)
      // false: disables injection
      // true: enables injection if that is not disabled in html-webpack-plugin
      // 'force': enables injection even if that is disabled in html-webpack-plugin
      inject: true,
      // Favicons configuration options (see below)
      favicons: {
        appName: 'Tarantino.io',
        appDescription: 'Cristina Tarantino portfolio app',
        developerName: 'Cristina Tarantino',
        developerURL: null, // prevent retrieving from the nearest package.json
        background: '#ddd',
        theme_color: '#333',
        // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: true,
          twitter: true,
          yandex: false,
          windows: true
        }
      }
    }),
    // This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS.
    // If your total stylesheet volume is big, it will be faster
    // because the CSS bundle is loaded in parallel to the JS bundle.
    new MiniCssExtractPlugin({
      filename: "[name].[md5:contenthash:hex:20].css",
    }),
    // It will search for CSS assets during the Webpack build and will optimize \ minimize the CSS
    // (by default it uses cssnano but a custom CSS processor can be specified).
    // Since extract-text-webpack-plugin only bundles (merges) text chunks, if it's used to bundle CSS,
    // the bundle might have duplicate entries (chunks can be duplicate
    // free but when merged, duplicate CSS can be created).
    new OptimizeCssAssetsPlugin({
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        map: {
          inline: false,
        },
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    })
  ],
};
