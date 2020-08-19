import { waitForNetworkIdle2, fillInput, waitForAndClickButton, wait, getElement } from "../utils"

/* Checks if a track is reposted by inspecting the button */
export const checkIfReposted = async (page) => {
  const button = await page.$(`button[name="repost"]`)
  const text = await page.evaluate(element => element.innerText, button)
  return text === 'REPOSTED'
}

/**
 * Reposts if needed
 * @param page 
 * @param baseUrl 
 * @param {config} config
 * @param {string} config.trackRoute the track page string to visit
 */
export const repostTrack = async (page, baseUrl, { trackRoute }) => {
  // Go to a track page
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/${trackRoute}`))

  const isReposted = await checkIfReposted(page)
  if (!isReposted) {
    await waitForAndClickButton(page, 'repost')
  }
  // Allow button click time to propagate
  await wait(1000)
}

/**
 * Undoes a repost if needed
 * @param page 
 * @param baseUrl 
 * @param {config} config
 * @param {string} config.trackRoute the track page string to visit
 */
export const undoRepostTrack = async (page, baseUrl, { trackRoute }) => {
  // Go to a track page
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/${trackRoute}`))

  const isReposted = await checkIfReposted(page)
  if (isReposted) {
    await waitForAndClickButton(page, 'repost')
  }
  // Allow button click time to propagate
  await wait(1000)
}
