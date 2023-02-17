import path from 'path'

import {
  Configuration,
  ProvidePlugin,
  ResolvePluginInstance,
  SourceMapDevToolPlugin
} from 'webpack'

const isProd = process.env.NODE_ENV === 'production'

const SOURCEMAP_URL = 'https://s3.us-west-1.amazonaws.com/sourcemaps.audius.co/'

type ModuleScopePlugin = ResolvePluginInstance & {
  allowedPaths: string[]
}

// This ensures we can use the resolve.alias for react/react-dom
function addReactToModuleScopePlugin(plugin: ModuleScopePlugin) {
  const reactLibs = ['react', 'react-dom']
  const reactPaths = reactLibs.map((reactLib) =>
    path.resolve(__dirname, 'node_modules', reactLib)
  )
  plugin.allowedPaths = [...plugin.allowedPaths, ...reactPaths]
}

export default {
  webpack: {
    configure: (config: Configuration) => {
      if (config.resolve?.plugins) {
        const [moduleScopePlugin] = config.resolve?.plugins
        addReactToModuleScopePlugin(moduleScopePlugin as ModuleScopePlugin)
      }

      return {
        ...config,
        module: {
          ...config.module,
          rules: [
            ...(config.module?.rules ?? []),
            {
              test: /\.js$/,
              enforce: 'pre',
              use: ['source-map-loader']
            },
            {
              test: /\.wasm$/,
              type: 'webassembly/async'
            },
            {
              test: /\.(glsl|vs|fs|vert|frag)$/,
              exclude: /node_modules/,
              use: ['raw-loader', 'glslify-loader'],
              type: 'javascript/auto'
            },
            {
              test: /\.m?js$/,
              resolve: {
                fullySpecified: false // disable the behavior
              }
            }
          ]
        },
        plugins: [
          ...(config.plugins ?? []),
          new ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
          }),
          ...(isProd
            ? [
                new SourceMapDevToolPlugin({
                  publicPath: SOURCEMAP_URL,
                  filename: '[file].map'
                })
              ]
            : [])
        ],
        experiments: {
          ...config.experiments,
          asyncWebAssembly: true
        },
        resolve: {
          ...config.resolve,
          fallback: {
            ...config.resolve?.fallback,
            assert: require.resolve('assert'),
            constants: require.resolve('constants-browserify'),
            child_process: false,
            crypto: require.resolve('crypto-browserify'),
            fs: false,
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            net: false,
            os: require.resolve('os-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify'),
            url: require.resolve('url'),
            zlib: require.resolve('browserify-zlib')
          },
          alias: {
            ...config.resolve?.alias,
            react: path.resolve('./node_modules/react'),
            'react-dom': path.resolve('./node_modules/react-dom')
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
    enableTypeChecking: false
  }
}
