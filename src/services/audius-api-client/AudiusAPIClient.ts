import TimeRange from 'models/TimeRange'
import { removeNullable } from 'utils/typeUtils'
import { APIResponse, APITrack } from './types'
import * as adapter from './ResponseAdapter'

type Environment = 'production' | 'staging' | 'development'

const ENDPOINT_PROVIDER_MAP: { [env in Environment]: string } = {
  development: 'http://docker.for.mac.localhost:5000',
  staging: 'https://general-admission.staging.audius.co/api/',
  production: 'https://api.audius.co'
}

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
    await this._awaitInitialization()
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
    if (this.isInitialized) return

    try {
      console.debug('Initializing AudiusAPIClient')
      let endpoint
      if (this.environment === 'development') {
        // Hardcode local DP as endpoint if in development
        // env
        endpoint = ENDPOINT_PROVIDER_MAP[this.environment]
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
      console.debug('Initialized AudiusAPIClient')
    } catch {
      // TODO: handle this
    }
  }

  // Helpers

  _awaitInitialization() {
    if (this.isInitialized) return
    return new Promise(resolve => {
      this.awaitFunc = resolve
    })
  }

  async _getResponse<T>(resource: string): Promise<T> {
    const response = await fetch(resource)
    return response.json()
  }

  _constructUrl(
    path: string,
    queryParams: { [key: string]: string | number | undefined | null }
  ) {
    const params = Object.entries(queryParams)
      .filter(p => p[1] !== undefined && p[1] !== null)
      .map(p => `${p[0]}=${p[1]}`)
      .join('&')
    return `${this.endpoint}${path}?${params}`
  }
}

const getEnv = () => {
  const env = process.env.REACT_APP_ENVIRONMENT
  switch (env) {
    case 'production':
      return 'production'
    case 'staging':
      return 'staging'
    case 'development':
    default:
      return 'development'
  }
}

const instance = new AudiusAPIClient({ environment: getEnv() })

export default instance
