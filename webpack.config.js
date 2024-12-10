const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/index.js', // Entry file
  output: {
    filename: 'assets/js/[name].bundle.js', // Output JS
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans the output directory
  },
  module: {
    rules: [
      {
        test: /\.hbs$/, // Handlebars files
        loader: 'handlebars-loader',
        options: {
          partialDirs: [path.join(__dirname, 'src', 'partials')],
        },
      },
      {
        test: /\.(scss|css)$/i, // Sass and CSS files
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.js$/, // JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|gif|png|jpg)$/, // Assets
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/layouts/main.hbs', // Main template
      inject: true,
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/style.css',
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: './src/assets/images', to: 'assets/images' },
    //     { from: './src/assets/videos', to: 'assets/videos' },
    //     { from: './src/assets/fonts', to: 'assets/fonts' },
    //   ],
    // }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 8081,
    historyApiFallback: true,
    open: true, // Automatically open the browser
  },
  mode: 'development',
};