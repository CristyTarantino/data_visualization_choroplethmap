const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // this option controls if and how source maps are generated.
  devtool: 'eval-cheap-module-source-map',
  // compile the code in our entry point src/index.js and output a bundle in /dist/bundle.js
  entry: './src/index.js',
  // create a local server and server the content of the dist folder
  devServer: {
      port: 8080,
      contentBase: path.join(__dirname, "dist")
  },
  module: {
    rules: [
      {
        // regex to run the loader on all files ending with .js only
        test: /\.m?js$/,
        // we don't want to run the loader on node_modules contents
        exclude: /(node_modules|bower_components)/,
        use: {
          // specifying to use babel-loader
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            // creates style nodes from JS strings
            loader: "style-loader",
            options: {
              sourceMap: true
            }
          },
          {
            // translates CSS into CommonJS
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            // compiles Sass to CSS
            loader: "sass-loader",
            options: {
              outputStyle: 'expanded',
              sourceMap: true,
              sourceMapContents: true
            }
          }
          // Please note we are not running postcss here
        ]
      },
      {
        // Load all images as base64 encoding if they are smaller than 8192 bytes
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // On development we want to see where the file is coming from, hence we preserve the [path]
              name: '[path][name].[ext]?hash=[hash:20]',
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
        // Inject all assets into the given template
        // all JavaScript resources will be placed at the bottom of the body element
        inject: true
      }),
  ],
};
