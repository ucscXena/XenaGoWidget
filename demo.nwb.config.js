let path = require('path')

// Customize global RT settings here
let reactToolboxVariables = {
  'button-height': '30px'
}

module.exports = {
  type: 'react-component',
  babel: {
    runtime: 'polyfill',
  },
  karma:{
    // browsers: ['Chrome'],
    config(config) {
      // Change config as you wish
      config.browserNoActivityTimeout= 30000


      // You MUST return the edited config object
      return config
    }
  },
  webpack: {
    define:{
      __SERVER__:JSON.stringify('https://xenademo.berkeleybop.io/xena-analysis'),
      __VERSION__: JSON.stringify(require('./package.json').version)
    },
    styles: {
      css: [
        // Create a rule which provides the specific setup react-toolbox v2 needs
        {
          include: [/react-toolbox/,/node_modules/, path.join(__dirname, 'src')],
          // css-loader options
          css: {
            modules: true,
            localIdentName: '[name]--[local]--[hash:base64:8]',
            sourceMap: true
          },
          // postcss-loader options
          postcss: {
            plugins: [
              require('postcss-cssnext')({
                features: {
                  customProperties: {
                    variables: reactToolboxVariables
                  }
                }
              })
            ]
          }
        },
      ]
    }
  },
  npm: {
    esModules: true,
    umd: false
  }
}
