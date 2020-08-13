import getConfig from '../config'
import { newPage, resetBrowser, wait } from '../utils'
import playTrack from '../flows/play-track'

const config = getConfig()

describe(
  'Play Track',
  () => {
    let page

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
    }, config.defaultTestTimeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      'should play a trending track',
      async () => {
        await playTrack(page, config.baseUrl, 'trending')
        const playing = await page.evaluate(() => {
          return !window.audio.paused
        })
        expect(playing).toBe(true)
      },
      config.defaultTestTimeout
    )
  },
  config.defaultTestTimeout
)
