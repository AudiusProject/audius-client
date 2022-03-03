import React from 'react'

import ReactDOM from 'react-dom'
// @ts-ignore
import { render } from 'react-nil'

import './index.css'

// Import CSS first so it's resolved in the right order.
// Unsure why importing this component first would change that, but it appears to
// when running in dev mode.
import Root from './root'

const REACT_APP_NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

if (REACT_APP_NATIVE_MOBILE) {
  render(<Root />)
} else {
  ReactDOM.render(<Root />, document.getElementById('root'))
}
