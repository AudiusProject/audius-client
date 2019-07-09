import { wait, waitForSplashScreen } from '../utils'

export const playTrack = async (page, baseUrl, route) => {
  await page.goto(`${baseUrl}/${route}`, {
    waitUntil: 'networkidle0'
  })
  await waitForSplashScreen(page)
  await page.waitForSelector(`div[class*=TrackTile_loaded]`)
  // Play the first track tile.
  await page.click(`div[class^=TrackTile_contentSection]`)
  // Make sure audio playback starts.
  await wait(200)
}

export default playTrack
