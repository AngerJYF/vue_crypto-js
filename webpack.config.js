const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = {
  entry: './src/index.js',
  output: {
    // 如果你用 Webpack 构建 SDK 并希望浏览器直接使用，需配置 library + libraryTarget: 'umd'
    library: 'JYFSDK', // 注：这里配置的name,用在index.html引用时 new JYFSDK({...})
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    // 如果你不希望把 crypto-js 打包进去，可启用这一行：
    // 'crypto-js': 'CryptoJS',
  },
};

module.exports = [
  {
    ...baseConfig,
    mode: 'development',
    devServer: {
      static: path.resolve(__dirname, './'),
      port: 8086,
      open: true,   // 自动打开浏览器
      hot: true,    // 热更新
    },
    output: {
      ...baseConfig.output,
      filename: 'bundle-sdk.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html', // 同样可用于产物预览（可选）
        filename: 'index.html',
      }),
    ],
  },
  {
    ...baseConfig,
    mode: 'production',
    output: {
      ...baseConfig.output,
      filename: 'bundle-sdk.min.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html', // 同样可用于产物预览（可选）
        filename: 'index.html',
        inject: 'head',  // body：插入到body闭合标签前；head: 插入到 <head> 标签中（不推荐，可能阻塞渲染)
        scriptLoading: 'blocking', // 不加 defer！
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: '/@license/i', // 保留合法 License
          }
        }
      })],
    },
  },
];