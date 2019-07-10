import path from 'path'
import {
  waitForSplashScreen,
  waitForAndClickButton,
  waitForNetworkIdle2
} from '../utils'

export const uploadTrack = async (page, baseUrl) => {
  const testTrackPath = '../assets/track.mp3'

  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/upload`))
  await waitForSplashScreen(page)

  /** ======== Upload Media Page ======== */
  await page.waitForSelector('div[class^=Dropzone]')
  // NOTE: Clicking the dropzone and opening the file uploader modal is possible, but
  // there is currently no way to close the file upload modal. https://github.com/GoogleChrome/puppeteer/issues/2946
  const dropZone = await page.$(
    `div[class^="Dropzone_dropzone"] input[type="file"]`
  )
  await dropZone.uploadFile(path.resolve(__dirname, testTrackPath))

  // Wait until track preview
  await page.waitForSelector('div[class^=TrackPreview]')
  await waitForAndClickButton(page, 'continue')

  /** ======== Edit Track Upload Page ======== */
  // Wait until track preview
  await page.waitForXPath("//div[contains(text(), 'Complete Your Track')]")

  const selectCategory = await page.$(`div[class^=DropdownInput_wrapper]`)
  await selectCategory.click()

  const categoryChoice = await page.$x("//li[contains(text(), 'Rock')]")
  await categoryChoice[0].click()

  await waitForAndClickButton(page, 'continue')

  /** ======== Finish Track Upload Page ======== */
  await page.waitForXPath("//span[contains(text(), 'Upload More')]")
  await waitForAndClickButton(page, 'viewMedia')
}

export default uploadTrack
