import TimeRange from 'models/TimeRange'
import { removeNullable } from 'utils/typeUtils'
import { APIResponse, APITrack } from './types'
import * as adapter from './ResponseAdapter'

type Environment = 'production' | 'staging' | 'development'

const ENDPOINT_PROVIDER_MAP: { [env in Environment]: string } = {
  development: 'http://docker.for.mac.localhost:5000',
  staging: '',
  production: 'https://api.audius.co'
}

type GetTrendingArgs = {
  timeRange?: TimeRange
  offset?: number
  limit?: number
  currentUserId?: string
  genre?: string
}

class AudiusAPIClient {
  isInitialized = false
  endpoint: string | null = null
  environment: Environment
  awaitFunc: (() => void) | null

  constructor({ environment }: { environment: Environment }) {
    this.environment = environment
    this.awaitFunc = null
  }

  async getTrending({
    timeRange = TimeRange.WEEK,
    limit = 200,
    offset = 0,
    currentUserId,
    genre
  }: GetTrendingArgs) {
    console.log('Getting trending, awaiting init')
    await this._awaitInitialization()
    console.log('Got trending! running')
    // TODO: use a query builder
    let endpoint = `${this.endpoint}/tracks/trending?time=${timeRange}&limit=${limit}&offset=${offset}`
    if (currentUserId) {
      endpoint = `${endpoint}&user_id=${currentUserId}`
    }
    if (genre) {
      endpoint = `${endpoint}&genre=${genre}`
    }

    const trendingResponse: APIResponse<APITrack[]> = await this.getResponse(
      endpoint
    )
    const adapted = trendingResponse.data
      .map(adapter.makeTrack)
      .filter(removeNullable)
    return adapted
  }

  async init() {
    if (this.isInitialized) return

    try {
      let endpoint
      if (this.environment === 'development') {
        // Hardcode local DP as endpoint if in development
        // env
        endpoint = ENDPOINT_PROVIDER_MAP[this.environment]
        await new Promise(resolve => {
          console.log('inside init promise')
          setTimeout(() => {
            console.log('RESOLVING')
            resolve()
          }, 5000)
        })
      } else {
        const endpointProvider = ENDPOINT_PROVIDER_MAP[this.environment]
        const endpointsResponse = await fetch(endpointProvider)
        const endpointsJson = await endpointsResponse.json()
        const { data: endpoints }: { data: string[] } = endpointsJson
        endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
      }
      this.endpoint = `${endpoint}/v1/full`
      this.isInitialized = true
      if (this.awaitFunc) this.awaitFunc()
    } catch {
      // TODO: handle this
    }
  }

  _awaitInitialization() {
    if (this.isInitialized) return
    return new Promise(resolve => {
      this.awaitFunc = resolve
    })
  }

  // Helpers
  async getResponse<T>(resource: string): Promise<T> {
    const response = await fetch(resource)
    return response.json()
  }
}

export default AudiusAPIClient
