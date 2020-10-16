import {
  newPage,
  resetBrowser
} from '../utils'

const timeout = 60 * 1000

it(
  'visits',
  async () => {
    const page = await newPage()
    await resetBrowser(page, 'https://dashboard.audius.org')
    await page.close()
  },
  timeout
)
