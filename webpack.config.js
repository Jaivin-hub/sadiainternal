const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');  // Import webpack for DefinePlugin

module.exports = {
  entry: './src/js/index.js', // Entry point for JavaScript
  output: {
    filename: 'assets/js/[name].bundle.js',  // Keep JS in the assets folder
    path: path.resolve(__dirname, 'dist'),  // Output directory
    clean: true,  // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,  // Handlebars template files
        loader: 'handlebars-loader',
        options: {
          partialDirs: [
            path.join(__dirname, 'src', 'partials'),
            path.join(__dirname, 'src', 'partials', 'sections'),
          ],
        },
      },
      {
        test: /\.(sa|sc|c)ss$/i,  // CSS and Sass files
        use: [
          MiniCssExtractPlugin.loader, // Extracts CSS to separate file
          'css-loader',                // Translates CSS into CommonJS
          'sass-loader',               // Compiles Sass to CSS
        ],
      },
      {
        test: /\.js$/,  // JavaScript files
        exclude: /node_modules/,  // Exclude node_modules
        use: {
          loader: 'babel-loader',  // Use Babel to transpile JS
          options: {
            presets: ['@babel/preset-env'],  // Use the env preset for transpilation
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|gif)$/, // Match font and image files
        type: 'asset/resource',  // Let Webpack handle asset loading
        generator: {
          filename: 'assets/[name][ext]',  // Output assets to assets/ folder
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/layouts/main.hbs',  // Template for main HTML file
      inject: false,  // Do not inject scripts
      filename: 'index.html',  // Output filename
    }),
    new HtmlWebpackPlugin({
      template: 'src/layouts/recipe-details.hbs',  // Template for recipe details page
      inject: false,
      filename: 'recipe-details.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/layouts/product-listing.hbs',  // Template for product listing page
      inject: false,
      filename: 'product-listing.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/layouts/hack-listing.hbs',  // Template for hack listing page
      inject: false,
      filename: 'hack-listing.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/layouts/campaign.hbs',  // Template for campaign page
      inject: false,
      filename: 'campaign.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/layouts/about.hbs',  // Template for about page
      inject: false,
      filename: 'about.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/style.css',  // Output CSS to assets folder
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets/images', to: './assets/images', noErrorOnMissing: true },
        { from: './src/assets/videos', to: './assets/videos', noErrorOnMissing: true },
        { from: './src/assets/fonts', to: './assets/fonts', noErrorOnMissing: true },
        { from: './node_modules/slick-carousel/slick/slick.css', to: './assets/css/slick.css' },
        { from: './node_modules/slick-carousel/slick/slick-theme.css', to: './assets/css/slick-theme.css' },
        { from: './node_modules/slick-carousel/slick/slick.min.js', to: './assets/js/slick.min.js' },
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 8080,
    historyApiFallback: {
      rewrites: [
        { from: /^\/recipe-details/, to: '/recipe-details.html' },
        { from: /^\/product-listing/, to: '/product-listing.html' },
        { from: /^\/hack-listing/, to: '/hack-listing.html' },
        { from: /^\/campaign/, to: '/campaign.html' },
        { from: /^\/about/, to: '/about.html' },
        { from: /./, to: '/index.html' },
      ],
    },
  },
  mode: 'production',  // Set mode to 'production' for optimizations

  performance: {
    hints: false,  // Disable performance hints
  },
};
