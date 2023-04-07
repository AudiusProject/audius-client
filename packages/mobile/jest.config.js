const { defaults: tsjPreset } = require('ts-jest/presets')

const transformIncludePackages = [
  '@react-native',
  'react-native',
  '@sentry',
  'rn-flipper-async-storage-advanced',
  '@audius/sdk',
  'rpc-websockets',
  'uuid',
  'jayson',
  'query-string',
  'decode-uri-component',
  'split-on-first',
  'filter-obj',
  'rn-fetch-blob',
  '@hcaptcha',
  '@react-navigation',
  'autolinker',
  '@sayem314',
  '@walletconnect'
].join('|')

const clientAliases = [
  'assets',
  'audio',
  'common',
  'pages',
  'models',
  'schemas',
  'services',
  'store',
  'utils',
  'workers'
].reduce(
  (result, current) => ({
    ...result,
    [`^${current}(.*)$`]: `<rootDir>/../web/src/${current}$1`
  }),
  {}
)

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // ...tsjPreset,
  preset: 'react-native',
  transformIgnorePatterns: [`node_modules/(?!(${transformIncludePackages}))`],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['<rootDir>/node_modules', 'node_modules'],
  moduleNameMapper: {
    '^app(.*)$': '<rootDir>/src$1',
    ...clientAliases
  },
  setupFiles: ['<rootDir>/jest.setup.js']
}
