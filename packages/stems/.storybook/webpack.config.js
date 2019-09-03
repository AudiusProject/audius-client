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
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};