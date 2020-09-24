import TimeRange from 'models/TimeRange'
import { removeNullable } from 'utils/typeUtils'
import { APIResponse, APITrack } from './types'
import * as adapter from './ResponseAdapter'
import AudiusBackend from 'services/AudiusBackend'

const ENDPOINT_MAP = {
  trending: '/tracks/trending'
}

type GetTrendingArgs = {
  timeRange?: TimeRange
  offset?: number
  limit?: number
  currentUserId?: string
  genre?: string
}

type InitializationState =
  | { state: 'uninitialized ' }
  | {
      state: 'initializing'
      initPromise: Promise<void>
    }
  | {
      state: 'initialized'
      endpoint: string
    }

class AudiusAPIClient {
  initializationState: InitializationState = { state: 'uninitialized ' }
  overrideEndpoint?: string

  constructor({ overrideEndpoint }: { overrideEndpoint?: string } = {}) {
    console.debug('cons')
    this.overrideEndpoint = overrideEndpoint
  }

  async getTrending({
    timeRange = TimeRange.WEEK,
    limit = 200,
    offset = 0,
    currentUserId,
    genre
  }: GetTrendingArgs) {
    console.log('AWAITING TRENDING')
    await this._awaitInitialization()
    console.log('GOING FORTH W TRENDING')
    const params = {
      time: timeRange,
      limit,
      offset,
      user_id: currentUserId,
      genre
    }

    const endpoint = this._constructUrl(ENDPOINT_MAP.trending, params)

    const trendingResponse: APIResponse<APITrack[]> = await this._getResponse(
      endpoint
    )
    const adapted = trendingResponse.data
      .map(adapter.makeTrack)
      .filter(removeNullable)
    return adapted
  }

  async init() {
    console.debug('init')
    // Initialized state
    if (this.initializationState.state === 'initialized') return

    // Initializing state
    if (this.initializationState.state === 'initializing') {
      return this.initializationState.initPromise
    }

    // Uninitialized state
    // If override passed, use that and return
    if (this.overrideEndpoint) {
      const endpoint = `${this.overrideEndpoint}/v1/full`
      console.log('Using endpoint: ' + endpoint)
      this.initializationState = { state: 'initialized', endpoint: endpoint }
      console.debug('using override')
      return
    }

    // Await for libs discprov selection
    const initPromise: Promise<void> = new Promise(resolve => {
      console.debug('Initializing AudiusAPIClient')
      AudiusBackend.addDiscoveryProviderSelectionListener(
        (endpoint: string) => {
          const fullEndpoint = `${endpoint}/v1/full`
          this.initializationState = {
            state: 'initialized',
            endpoint: fullEndpoint
          }
          console.debug('Initialized AudiusAPIClient')
          resolve()
        }
      )
    })
    console.log('setting initializing')
    this.initializationState = { state: 'initializing', initPromise }
  }

  // Helpers

  _awaitInitialization() {
    if (this.initializationState.state === 'initialized') return
    if (this.initializationState.state === 'initializing')
      return this.initializationState.initPromise
    throw new Error('Must call init before calling methods on AudiusAPIClient')
  }

  async _getResponse<T>(resource: string): Promise<T> {
    const response = await fetch(resource)
    return response.json()
  }

  _constructUrl(
    path: string,
    queryParams: { [key: string]: string | number | undefined | null }
  ) {
    if (this.initializationState.state !== 'initialized')
      throw new Error("Can't construct URL in non-initialized state")
    const params = Object.entries(queryParams)
      .filter(p => p[1] !== undefined && p[1] !== null)
      .map(p => `${p[0]}=${p[1]}`)
      .join('&')
    return `${this.initializationState.endpoint}${path}?${params}`
  }
}

const override = 'http://docker.for.mac.localhost:5000'
const instance = new AudiusAPIClient({ overrideEndpoint: override })
// const instance = new AudiusAPIClient()

export default instance
