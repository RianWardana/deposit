const path = require('path');

module.exports = {
  entry: './index.html',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};