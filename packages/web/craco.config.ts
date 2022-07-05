import path from 'path'

import { Configuration, ProvidePlugin } from 'webpack'

const isNative = process.env.REACT_APP_NATIVE_NAVIGATION_ENABLED === 'true'

export default {
  webpack: {
    configure: (webpackConfig: Configuration) => {
      return {
        ...webpackConfig,
        plugins: [
          ...(webpackConfig.plugins ?? []),
          new ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
          })
        ],
        experiments: {
          ...webpackConfig.experiments,
          asyncWebAssembly: true,
          layers: true,
          lazyCompilation: true,
          outputModule: true,
          syncWebAssembly: true,
          topLevelAwait: true
        },
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve?.fallback,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            assert: require.resolve('assert'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify'),
            url: require.resolve('url'),
            path: require.resolve('path-browserify'),
            constants: require.resolve('constants-browserify'),
            fs: false,
            zlib: require.resolve('browserify-zlib'),
            net: false,
            child_process: false
          },
          alias: {
            ...webpackConfig.resolve?.alias,
            ...(isNative ? { react: 'react16' } : {})
          }
        },
        ignoreWarnings: [
          function ignoreSourcemapsloaderWarnings(warning: any) {
            return (
              warning.module &&
              warning.module.resource.includes('node_modules') &&
              warning.details &&
              warning.details.includes('source-map-loader')
            )
          }
        ]
      }
    }
  },
  eslint: {
    enable: false
  },
  typescript: {
    enableTypeChecking: true
  }
}
