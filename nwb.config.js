let reactToolboxVariables = {
    'button-height': '30px'
};
module.exports = {
    type: 'react-component',
    webpack: {
        styles: {
            css: [
                // Create a rule which provides the specific setup react-toolbox v2 needs
                {
                    include: /react-toolbox/,
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
                // Create a catch-all rule for other CSS
                {
                    exclude: /react-toolbox/
                }
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
