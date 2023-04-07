module.exports = (api) => {
  const babelEnv = api.env()
  const plugins = [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    [
      'import',
      {
        libraryName: 'react-use',
        camel2DashComponentName: false,
        customName(/** @type {string} */ name) {
          const libraryDirectory = name.startsWith('Use')
            ? 'lib/component'
            : name.startsWith('create')
            ? 'lib/factory'
            : 'lib'
          return `react-use/${libraryDirectory}/${name}`
        }
      },
      'import-react-use'
    ]
  ]

  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }])
  }

  plugins.push('react-native-reanimated/plugin')

  return {
    presets: [
      [
        'module:metro-react-native-babel-preset',
        { useTransformReactJSXExperimental: true },
        '@babel/preset-typescript'
      ]
    ],
    plugins
  }
}
