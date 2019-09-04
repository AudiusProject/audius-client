<img src="https://user-images.githubusercontent.com/2731362/64272626-9c3b8800-cef4-11e9-973e-0e38a666ec46.png" alt="stems" width="375">

> 

[![NPM](https://img.shields.io/npm/v/stems.svg)](https://www.npmjs.com/package/stems) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save stems
```

## Development

Run the example app:

```bash
cd example
npm start
```

Run a local Stems against another repo:

```bash 
# Create a system link
npm link
# You may need this line
# https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react
# npm link <other repo>/node_modules/react


<other repo> npm link @audius/stems

# For hot-reloading
npm start
```