const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean dist folder on each build
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          partialDirs: [
            path.join(__dirname, 'src', 'partials'),
            path.join(__dirname, 'src', 'partials', 'sections'),
          ],
        },
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      // For logos images
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        include: path.resolve(__dirname, 'src/assets/images/logos'),
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/logos/[name][ext]', // Place in logos folder
        },
      },
      // For banner images
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        include: path.resolve(__dirname, 'src/assets/images/banner'),
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/banner/[name][ext]', // Place in banner folder
        },
      },
      // For fav icons
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        include: path.resolve(__dirname, 'src/assets/images/fav'),
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/fav/[name][ext]', // Place in fav folder
        },
      },
      // For recipe images
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        include: path.resolve(__dirname, 'src/assets/images/recipes'),
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/recipes/[name][ext]', // Place in recipes folder
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/layouts/main.hbs',
      inject: false,
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/pages/home.hbs',
      inject: 'body',
      filename: 'home.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/style.css',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 8080,
    historyApiFallback: true,
  },
  mode: 'development',
};
