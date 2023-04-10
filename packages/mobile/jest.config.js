// These are required to be transformed because
// they are ESM and jest doesn't support ESM
const transformIncludePackages = [
  '@audius/sdk',
  '@hcaptcha',
  '@react-native',
  '@react-navigation',
  '@sayem314',
  '@sentry',
  '@walletconnect',
  'autolinker',
  'decode-uri-component',
  'ffmpeg-kit-react-native',
  'filter-obj',
  'jayson',
  'query-string',
  'react-native',
  'rn-fetch-blob',
  'rn-flipper-async-storage-advanced',
  'rpc-websockets',
  'split-on-first',
  'uuid'
].join('|')

// These match the aliases defined in metro.config.js
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

module.exports = {
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
