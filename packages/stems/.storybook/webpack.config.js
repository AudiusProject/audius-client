module.exports = ({ config }) => {
  // ts-config.
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('awesome-typescript-loader'),
      },
      {
        loader: require.resolve('react-docgen-typescript-loader'),
        options: {
          shouldExtractLiteralValuesFromEnum: true
        }
      }
    ],
  });
  // css-modules.
  config.module.rules.find(
    rule => rule.test.toString() === '/\\.css$/',
  ).exclude = /\.module\.css$/;
  config.module.rules.push({
    test: /\.module\.css$/,
    loaders: [
      require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 1,
          modules: {
              localIdentName: "[name]__[local]___[hash:base64:5]",
          },	
        },
      }
    ]
  });

  // Typescript
  config.resolve.extensions.push('.ts', '.tsx');

  // SVGR
  const assetRule = config.module.rules.find(({ test }) => test.test('.svg'));
  const assetLoader = {
    loader: assetRule.loader,
    options: assetRule.options || assetRule.query,
  };
  config.module.rules.unshift({
    test: /\.svg$/,
    use: ['@svgr/webpack', assetLoader],
  });
  
  return config;
};