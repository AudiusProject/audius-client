export const newPage = async (width = 1600, height = 960) => {
  let page = await global.__BROWSER__.newPage()
  page.setViewport({
    width,
    height
  })
  return page
}

export const wait = async milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const waitForExit = async (page, selector, exitTimeout = 8000) => {
  return Promise.race([
    new Promise((resolve, reject) =>
      setTimeout(() => {
        return reject(
          `Element w/ selector ${selector}, did not disappear from fom within timeout of ${exitTimeout}`
        )
      }, exitTimeout)
    ),
    new Promise((resolve, reject) => {
      let interval = setInterval(async () => {
        const element = await page.$(selector)
        if (element) return
        clearInterval(interval)
        resolve()
      }, 100)
    })
  ])
}

export const waitForResponse = async (page, pathname) => {
  return new Promise((resolve, reject) => {
    page.on("response", response => {
      const resUrl = new URL(response.url())
      if (resUrl.pathname === pathname) {
        return resolve(response.json())
      }
    })
  })
}

export const waitForSplashScreen = async page => {
  await waitForExit(page, "div[class*=splashScreenWrapper]")
}

export const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))

export const fillInput = async (page, name, value) =>
  page.type(`input[name='${name}']`, value)

export const waitForAndClickButton = async (page, name, selector = "") => {
  await page.waitForSelector(`button${selector}[name="${name}"]`)
  const btn = await page.$(`button${selector}[name="${name}"]`)
  await btn.click()
}

export const resetBrowser = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: "networkidle2" })
  await page.evaluate(() => localStorage.clear())
  await page.goto(baseUrl, { waitUntil: "networkidle0" })
}
