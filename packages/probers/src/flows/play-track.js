import { wait, waitForNetworkIdle0 } from '../utils'

export const playTrack = async (page, baseUrl, route) => {
  await waitForNetworkIdle0(page, page.goto(`${baseUrl}/${route}`))

  // Tracks may still be loading, so wait for track to render
  await page.waitForSelector(`span[class^=TrackTile_title]`)

  // Play the first track tile.
  await page.click(`div[class^=TrackTile_container]`)

  // Make sure audio playback starts without error
  await wait(1000)
}

export default playTrack
