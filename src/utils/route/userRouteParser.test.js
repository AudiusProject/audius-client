import { parseUserRoute } from './userRouteParser'

// eslint-disable-next-line
import { mockDecode } from '__mocks__/Hashids'

describe('parseUserRoute', () => {
  it('can decode a user handle route', () => {
    const route = '/vivelatarte'
    const { userId, handle } = parseUserRoute(route)
    expect(handle).toEqual('vivelatarte')
    expect(userId).toEqual(null)
  })

  it('can decode a hashed user id route', () => {
    mockDecode.mockReturnValue([11845])

    const route = '/users/eP9k7'
    const { userId, handle } = parseUserRoute(route)
    expect(userId).toEqual(11845)
    expect(handle).toEqual(null)
  })

  it('returns null for a static route', () => {
    const route = '/404'
    const params = parseUserRoute(route)
    expect(params).toEqual(null)
  })

  it('returns null for an invalid hash id', () => {
    mockDecode.mockReturnValue([NaN])

    const route = '/users/asdf'
    const params = parseUserRoute(route)
    expect(params).toEqual(null)
  })
})
