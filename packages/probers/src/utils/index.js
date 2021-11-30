/* global localStorage */
import getConfig from '../config'

export const newPage = async (width = 1600, height = 960) => {
  let page = await global.__BROWSER__.newPage()

  page.setViewport({
    width,
    height
  })
  await page.setDefaultNavigationTimeout(0);

  // Monkeypatch page screenshot method for ease of debugging
  page.ss = async (identifier) => {
    await page.screenshot({ path: `test_output/${identifier}.png` })
  }

  return page
}

export const wait = async milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const IGNORED_REQUESTS = /recaptcha|notifications|sentry/

// See https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#framegotourl-options
const waitForNetworkIdle = (page, timeout, maxInflightRequests = 0, exitTimeout = 2 * 60 * 1000) => {
  page.on('request', onRequestStarted)
  page.on('requestfinished', onRequestFinished)
  page.on('requestfailed', onRequestFinished)

  let inflight = 0
  let fulfill
  let fail
  let promise = new Promise((resolve, reject) => {
    fulfill = resolve
    fail = reject
  })
  let timeoutId = setTimeout(onTimeoutDone, timeout)
  let exitTimeoutId = setTimeout(onExit, exitTimeout)
  let remaining = new Set()
  return promise


  function onTimeoutDone () {
    clearTimeout(exitTimeoutId)
    page.removeListener('request', onRequestStarted)
    page.removeListener('requestfinished', onRequestFinished)
    page.removeListener('requestfailed', onRequestFinished)
    // console.log(`On timeout done, inflight: ${inflight}`)
    fulfill()
  }

  function onRequestStarted (r) {
    const url = r.url()
    if (IGNORED_REQUESTS.test(url)) return
    ++inflight
    remaining.add(r.url())
    if (inflight > maxInflightRequests) { clearTimeout(timeoutId) }
  }

  function onRequestFinished (r) {
    const url = r.url()
    if (IGNORED_REQUESTS.test(url)) return
    // console.log(`${inflight} Requests In-Flight`)
    remaining.delete(r.url())
    if (inflight === 0) { return }
    --inflight
    if (inflight === maxInflightRequests) { timeoutId = setTimeout(onTimeoutDone, timeout) }
  }

  function onExit () {
    console.log("FAILING DUE TO TIMEOUT")
    console.log(`Inflight requests ${inflight}: ${remaining}`)
    fail()
  }
}

export const waitForNetworkIdle0 = (page, action, timeout = 3000, exitTimeout = 60000) => {
  return Promise.all([
    action,
    waitForNetworkIdle(page, timeout, 0, exitTimeout)
  ])
}

export const waitForExit = async (page, selector, exitTimeout = 8000) => {
  let interval
  return Promise.race([
    new Promise((resolve, reject) =>
      setTimeout(() => {
        clearInterval(interval)
        return reject(new Error(
          `Element w/ selector ${selector}, did not disappear from fom within timeout of ${exitTimeout}`
        ))
      }, exitTimeout)
    ),
    new Promise((resolve, reject) => {
      interval = setInterval(async () => {
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
    page.on('response', async response => {
      const resUrl = new URL(response.url())
      const requestMethod = response.request().method()
      if (resUrl.pathname === pathname && requestMethod !== 'OPTIONS') {
        const json = await response.json()
        return resolve(json)
      }
    })
  })
}

export const reload = async (page) => {
  await page.evaluate(() => {
    location.reload(true)
  })
  await waitForNetworkIdle0(page)
}

export const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))

export const fillInput = async (page, name, value) => {
  await page.type(`input[name='${name}']`, value)
  await wait(500) // debounce input
}

export const waitForAndClickButton = async (page, name, selector = '', config) => {
  await page.waitForSelector(`button${selector}[name="${name}"]`, config)
  const btn = await page.$(`button${selector}[name="${name}"]`)
  await btn.click()
}

export const resetBrowser = async (page, baseUrl) => {
  await waitForNetworkIdle0(page, page.goto(baseUrl))
  await page.evaluate(() => localStorage.clear())
  await waitForNetworkIdle0(page, page.goto(baseUrl))
}

export const urlLogin = async (page, baseUrl, route, entropy) => {
  const base64Entropy = Buffer.from(entropy).toString('base64')
  const url = `${baseUrl}/${route}?login=${base64Entropy}`
  await waitForNetworkIdle0(page, page.goto(url))
}

export const getEntropy = async (page) => {
  const entropy = await page.evaluate(() => localStorage.getItem('hedgehog-entropy-key'))
  return entropy
}

const logRequestServices = ['discoveryprovider', 'identityservice', 'creatornode']
export const logPageRequests = async (page) => {
  const onRequest = (request) => {
    const uri = request.url()
    if (logRequestServices.some(service => uri.includes(service))) console.log(`Making Request to URI: ${uri}`)
  }
  const onResponse = async (response) => {
    const uri = response.url()
    if (logRequestServices.some(service => uri.includes(service))) {
      console.log(`Reponse status: ${response.status()} from URI: ${uri}`)
    }
  }

  page.on('request', onRequest)
  page.on('response', onResponse)

  return () => {
    page.removeListener('request', onRequest)
    page.removeListener('response', onResponse)
  }
}
