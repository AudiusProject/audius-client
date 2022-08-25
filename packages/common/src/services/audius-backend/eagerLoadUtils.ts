import { Env } from '../env'
import { LocalStorage } from '../local-storage'

const DISCOVERY_PROVIDER_TIMESTAMP = '@audius/libs:discovery-node-timestamp'

export const LIBS_INITTED_EVENT = 'LIBS_INITTED_EVENT'

/**
 * Wait for the `LIBS_INITTED_EVENT` or pass through if there
 * already exists a mounted `window.audiusLibs` object.
 */
export const waitForLibsInit = async () => {
  // If libs is already defined, it has already loaded & initted
  // so do nothing
  // @ts-ignore
  if (window.audiusLibs) return
  // Add an event listener and resolve when that returns
  return new Promise((resolve) => {
    // @ts-ignore
    if (window.audiusLibs) resolve()
    window.addEventListener(LIBS_INITTED_EVENT, resolve)
  })
}

export const getEagerDiscprov = async (
  localStorage: LocalStorage,
  env: Env
) => {
  const cachedDiscProvData = await localStorage.getItem(
    DISCOVERY_PROVIDER_TIMESTAMP
  )

  // Set the eager discprov to use to either
  // 1. local storage discprov if available
  // 2. dapp whitelist
  // Note: This discovery provider is only used on intial paint
  let eagerDiscprov: string
  if (cachedDiscProvData) {
    const cachedDiscprov = JSON.parse(cachedDiscProvData)
    eagerDiscprov = cachedDiscprov.endpoint
  } else {
    const EAGER_DISCOVERY_NODES = env.EAGER_DISCOVERY_NODES?.split(',') ?? []
    eagerDiscprov =
      EAGER_DISCOVERY_NODES[
        Math.floor(Math.random() * EAGER_DISCOVERY_NODES.length)
      ]
  }
  return eagerDiscprov
}
