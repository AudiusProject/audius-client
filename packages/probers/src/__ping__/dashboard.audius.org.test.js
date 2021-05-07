import {
  newPage,
  resetBrowser,
  waitForNetworkIdle0
} from '../utils'

const timeout = 4 * 60 * 1000

it(
  'visits',
  async () => {
    const page = await newPage()
    await waitForNetworkIdle0(
      page,
      page.goto('https://dashboard.audius.org'),
      500,
      timeout
    )
    await page.close()
  },
  timeout
)
