import rollupTypescript from 'rollup-plugin-typescript2'
import typescript from 'typescript'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import postcssCustomProperties from 'postcss-custom-properties'
import svgr from '@svgr/rollup'

import pkg from './package.json'

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    postcss({
      plugins: [
        postcssCustomProperties({
          preserve: true,
          importFrom: [
            'src/assets/styles/colors.css',
            'src/assets/styles/fonts.css',
            'src/assets/styles/sizes.css'
          ]
        })
      ],
      modules: true
    }),
    url(),
    svgr(),
    resolve(),
    rollupTypescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      typescript
    }),
    commonjs()
  ]
}
