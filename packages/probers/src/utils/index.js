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

export const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))
