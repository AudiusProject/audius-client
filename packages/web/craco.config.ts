<<<<<<< HEAD
import path from 'path'

=======
// @ts-ignore
>>>>>>> e5eb20b5 (Upgrade CRA and webpack to v5)
import { addBeforeLoader, loaderByName, when } from '@craco/craco'
import { Configuration, RuleSetRule, webpack, ProvidePlugin } from 'webpack'

export default {
  // babel: {
  //   plugins: [
  //     'lodash',
  //     ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
  //   ]
  // },
  // webpack: {
  //   plugins: when(process.env.BUNDLE_ANALYZE === 'true', () => [
  //     new BundleAnalyzerPlugin()
  //   ]),
  //   configure: (webpackConfig: Configuration) => {
  //     if (isNative && webpackConfig?.resolve?.alias) {
  //       webpackConfig.resolve.alias = {
  //         ...webpackConfig.resolve.alias,
  //         react: 'react16'
  //       }
  //     }

  //     const wasmExtensionRegExp = /\.wasm$/
  //     webpackConfig.resolve?.extensions?.push('.wasm')

  //     webpackConfig.module?.rules?.forEach(rule => {
  //       const rulee = rule as RuleSetRule
  //       rulee.oneOf?.forEach(oneOf => {
  //         if (
  //           typeof oneOf.loader === 'string' &&
  //           oneOf.loader.indexOf('file-loader') >= 0
  //         ) {
  //           if (Array.isArray(oneOf.exclude)) {
  //             oneOf.exclude.push(wasmExtensionRegExp)
  //           }
  //         }
  //       })
  //     })

  //     const wasmLoader = {
  //       test: /\.wasm$/,
  //       include: /node_modules\/(bridge|token-bridge)/,
  //       loaders: ['wasm-loader']
  //     }

  //     addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader)

  //     return webpackConfig
  //   }
  // }  ,
  // Disabling for now while we upgrade eslint and improve our config
  webpack: {
    configure: (webpackConfig: Configuration) => {
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

      return {
        ...webpackConfig,
        plugins: [
          ...(webpackConfig.plugins ?? []),
          new ProvidePlugin({
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
          extensions: [...(webpackConfig.resolve?.extensions ?? []), '.wasm'],
          fallback: {
            ...webpackConfig.resolve?.fallback,
            util: require.resolve('util'),
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            assert: require.resolve('assert'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify'),
            url: require.resolve('url'),
            path: require.resolve('path-browserify'),
            fs: false,
            buffer: require.resolve('buffer/'),
            zlib: require.resolve('browserify-zlib'),
            net: require.resolve('net-browserify'),
            tls: require.resolve('tls-browserify'),
            constants: require.resolve('constants-browserify'),
            child_process: false,
            express: false
          }
        }
      }
    }
  },
  eslint: {
    enable: false
  },
  typescript: {
    enableTypeChecking: false
  }
}
