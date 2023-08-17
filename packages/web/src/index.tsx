/* eslint-disable import/order */
/* eslint-disable import/first */
import { setupTracing } from './utils/tracer'
setupTracing()
import 'setimmediate'

import { createRoot } from 'react-dom/client'

import './index.css'

// Import CSS first so it's resolved in the right order.
// Unsure why importing this component first would change that, but it appears to
// when running in dev mode.
import Root from './root'

// @ts-ignore
window.Buffer = require('buffer/').Buffer

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Root />)
}
