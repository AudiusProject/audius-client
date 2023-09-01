import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],

  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },

  docs: {
    autodocs: true
  },
  webpackFinal: (config: any) => {
    config.module.rules.find(
      (rule) => rule.test.toString() === '/\\.css$/'
    ).exclude = /\.module\.css$/

    config.module.rules = config.module.rules.filter(
      (rule) => rule.test && !rule.test.test('.svg')
    )

    config.module.rules = [
      {
        test: /\.svg$/,
        use: [require.resolve('@svgr/webpack')]
      },
      {
        test: /\.module\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            }
          }
        ]
      },
      ...config.module.rules
    ]

    config.resolve.plugins = [new TsconfigPathsPlugin()]

    return config
  }
}
