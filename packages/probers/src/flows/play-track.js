import { wait, waitForSplashScreen, waitForNetworkIdle2 } from '../utils'

export const playTrack = async (page, baseUrl, route) => {
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/${route}`))
  await waitForSplashScreen(page)
  await page.waitForSelector(`div[class*=TrackTile_loaded]`)
  await wait(200)
  // Play the first track tile.
  await page.click(`div[class^=TrackTile_contentSection]`)
  // Make sure audio playback starts.
  await wait(200)
}

export default playTrack
