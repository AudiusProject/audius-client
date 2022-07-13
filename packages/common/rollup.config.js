import rollupTypescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [rollupTypescript()],
  external: [
    '@reduxjs/toolkit/query/react',
    'qs',
    '@reduxjs/toolkit',
    'react-redux'
  ]
}
