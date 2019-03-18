let path = require('path');

// Customize global RT settings here
let reactToolboxVariables = {
    'button-height': '30px'
};

module.exports = {
    type: 'react-component',
	babel: {
		runtime: 'polyfill'
	},
    webpack: {
        styles: {
            css: [
                // Create a rule which provides the specific setup react-toolbox v2 needs
                {
                    include: [/react-toolbox/,/node_modules/, path.join(__dirname, 'src')],
                    // css-loader options
                    css: {
                        modules: true,
                        localIdentName: "[name]--[local]--[hash:base64:8]",
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
                // XXX This is interfering with the rule above.
                // Create a catch-all rule for other CSS
//                {
//                    exclude: [/react-toolbox/, path.join(__dirname, 'src')]
//                }
            ]
        }
    },
    npm: {
        esModules: true,
        umd: false
    }
};

// module.exports = {
//   type: 'react-component',
//   npm: {
//     esModules: true,
//     umd: false
//   }
// }
