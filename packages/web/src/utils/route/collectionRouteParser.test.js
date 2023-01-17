import { parseCollectionRoute } from './collectionRouteParser'

// eslint-disable-next-line
import { mockDecode } from '__mocks__/Hashids'

describe('parseCollectionRoute', () => {
  it('can decode a playlist id route', () => {
    const route = '/arizmendi/playlist/croissants-11'
    const { title, collectionId, handle, slug, collectionType } =
      parseCollectionRoute(route)
    expect(title).toBeNull()
    expect(collectionId).toBeNull()
    expect(handle).toEqual('arizmendi')
    expect(slug).toEqual('croissants-11')
    expect(collectionType).toEqual('playlist')
  })

  it('can decode an album id route', () => {
    const route = '/arizmendi/album/scones-20'
    const { title, collectionId, handle, slug, collectionType } =
      parseCollectionRoute(route)
    expect(title).toEqual('scones')
    expect(collectionId).toEqual(20)
    expect(handle).toEqual('arizmendi')
    expect(collectionType).toEqual('album')
    expect(slug).toBeNull()
  })

  it('can decode a hashed collection id route', () => {
    mockDecode.mockReturnValue([11845])

    const route = '/playlists/eP9k7'
    const { title, collectionId, handle, collectionType } =
      parseCollectionRoute(route)
    expect(title).toEqual(null)
    expect(collectionId).toEqual(11845)
    expect(handle).toEqual(null)
    expect(collectionType).toEqual(null)
  })

  it('returns null for invalid route format', () => {
    const route = '/arizmendi/playlist/invalid-url/name-asdf'
    const params = parseCollectionRoute(route)
    expect(params).toEqual(null)
  })

  it('returns null for invalid id in album id route', () => {
    const route = '/arizmendi/album/name-asdf'
    const params = parseCollectionRoute(route)
    expect(params).toEqual(null)
  })

  it('returns null for invalid id in hashed collection id route', () => {
    mockDecode.mockReturnValue([NaN])

    const route = '/playlists/asdf'
    const params = parseCollectionRoute(route)
    expect(params).toEqual(null)
  })
})
