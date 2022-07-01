<<<<<<< HEAD
import path from 'path'

=======
// @ts-ignore
>>>>>>> e5eb20b5 (Upgrade CRA and webpack to v5)
import { addBeforeLoader, loaderByName, when } from '@craco/craco'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import { Configuration, RuleSetRule, webpack, ProvidePlugin } from 'webpack'

export default {
  webpack: {
    configure: (webpackConfig: Configuration) => {
<<<<<<< HEAD
<<<<<<< HEAD
      // react-nil, our mobile-web renderer, requires react16
      if (isNative && webpackConfig?.resolve?.alias) {
        webpackConfig.resolve.alias.react = path.resolve(
          './node_modules/react16'
        )
      }

      // this prevents symlinked packages from using their own react
      // https://github.com/facebook/react/issues/13991#issuecomment-435587809
      if (!isNative && webpackConfig.resolve?.alias) {
        webpackConfig.resolve.alias.react = path.resolve('./node_modules/react')
      }
=======
      // const base = {
      //   experiments: {
      //     asyncWebAssembly: true
      //     // WebAssembly as async module (Proposal)
      //     // syncWebAssembly: true
      //   }
      //   // resolve: {
      //   //   fallback: {
      //   //     crypto: false,
      //   //     stream: false,
      //   //     http: false,
      //   //     url: false,
      //   //     https: false,
      //   //     zlib: false,
      //   //     assert: false,
      //   //     util: false,
      //   //     os: false,
      //   //     path: false,
      //   //     constants: false,
      //   //     fs: false
      //   //   }
      //   // }
      // }
      // if (isNative && webpackConfig?.resolve?.alias) {
      //   webpackConfig.resolve.alias = {
      //     ...webpackConfig.resolve.alias,
      //     react: 'react16'
      //   }
      // }
>>>>>>> e5eb20b5 (Upgrade CRA and webpack to v5)

      // const wasmExtensionRegExp = /\.wasm$/
      // webpackConfig.resolve?.extensions?.push('.wasm')

      // const wasmLoader = {
      //   test: /\.wasm$/,
      //   include: /node_modules\/(bridge|token-bridge)/,
      //   loaders: ['wasm-loader']
      // }

      // // addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader)

      // webpackConfig.module?.rules?.forEach((rule, index) => {
      //   const rulee = rule as RuleSetRule
      //   rulee.oneOf?.forEach((oneOf, i2) => {
      //     if (index === 1 && (i2 === 2 || i2 === 3)) {
      //       // @ts-ignore
      //       console.log(oneOf.use)
      //     }
      //     if (
      //       typeof oneOf.loader === 'string' &&
      //       oneOf.loader.indexOf('file-loader') >= 0
      //     ) {
      //       if (Array.isArray(oneOf.exclude)) {
      //         oneOf.exclude.push(wasmExtensionRegExp)
      //       }
      //     }
      //   })
      // })

      console.log('existing experiments??', webpackConfig.experiments)

=======
>>>>>>> 9cdfd584 (Replace rewired with craco)
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
