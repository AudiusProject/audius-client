/* global localStorage */

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

export const waitForNetworkIdle = (page, timeout, maxInflightRequests = 0) => {
  page.on('request', onRequestStarted)
  page.on('requestfinished', onRequestFinished)
  page.on('requestfailed', onRequestFinished)

  let inflight = 0
  let fulfill
  let promise = new Promise(resolve => { fulfill = resolve })
  let timeoutId = setTimeout(onTimeoutDone, timeout)
  return promise

  function onTimeoutDone () {
    page.removeListener('request', onRequestStarted)
    page.removeListener('requestfinished', onRequestFinished)
    page.removeListener('requestfailed', onRequestFinished)
    fulfill()
  }

  function onRequestStarted () {
    ++inflight
    if (inflight > maxInflightRequests) { clearTimeout(timeoutId) }
  }

  function onRequestFinished () {
    if (inflight === 0) { return }
    --inflight
    if (inflight === maxInflightRequests) { timeoutId = setTimeout(onTimeoutDone, timeout) }
  }
}

export const waitForNetworkIdle0 = (page, action) => {
  return Promise.all([
    action,
    waitForNetworkIdle(page, 500, 0)
  ])
}

export const waitForNetworkIdle2 = (page, action) => {
  return Promise.all([
    action,
    waitForNetworkIdle(page, 500, 2)
  ])
}

export const waitForExit = async (page, selector, exitTimeout = 8000) => {
  return Promise.race([
    new Promise((resolve, reject) =>
      setTimeout(() => {
        return reject(new Error(
          `Element w/ selector ${selector}, did not disappear from fom within timeout of ${exitTimeout}`
        ))
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
    page.on('response', response => {
      const resUrl = new URL(response.url())
      if (resUrl.pathname === pathname) {
        return resolve(response.json())
      }
    })
  })
}

export const waitForSplashScreen = async page => {
  await waitForExit(page, 'div[class*=splashScreenWrapper]')
}

export const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))

export const fillInput = async (page, name, value) => {
  return page.type(`input[name='${name}']`, value)
}

export const waitForAndClickButton = async (page, name, selector = '') => {
  await page.waitForSelector(`button${selector}[name="${name}"]`)
  const btn = await page.$(`button${selector}[name="${name}"]`)
  await btn.click()
}

export const resetBrowser = async (page, baseUrl) => {
  await waitForNetworkIdle0(page, page.goto(baseUrl))
  await page.evaluate(() => localStorage.clear())
  await waitForNetworkIdle0(page, page.goto(baseUrl))
}
