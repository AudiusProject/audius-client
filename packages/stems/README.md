<p align="center">
  <p align="center">
    An audio-forward React Component library built with ❤️ from the team <a href="https://audius.org">@Audius</a>.
  </p>
</p>

<br/>
<br/>

[![NPM](https://img.shields.io/npm/v/stems.svg)](https://www.npmjs.com/package/stems) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation

```bash
npm install --save @audius/stems
```

## Usage

```js
import React from 'react'
import { Button } from '@audius/stems'

import '@audius/stems/dist/stems.css'

const App = () => {
  return (
    <Button text='Hello World!' />
  )
}
```

Optional: You may also wish to include the Avenir font, which is provided as a css file

```js
import '@audius/stems/dist/avenir.css'
```

## Development

Run storybook:

```bash
npm run storybook
```

Run the example app (docs site):

```bash
cd example
npm start
```

Run local Stems against another repo:

```bash
git clone git@github.com:AudiusProject/stems.git
# Create a system link
npm link

# You may need this line so React versons don't conflict
# https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react
# npm link <other repo>/node_modules/react

npm start

<other repo> npm link @audius/stems
```