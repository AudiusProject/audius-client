import {
  addFolderToLibrary,
  containsTempPlaylist,
  findIndexInPlaylistLibrary,
  findInPlaylistLibrary,
  removeFromPlaylistLibrary,
  removePlaylistFolderInLibrary,
  removePlaylistLibraryDuplicates,
  renamePlaylistFolderInLibrary,
  reorderPlaylistLibrary,
  addPlaylistToFolder,
  extractTempPlaylistsFromLibrary,
  replaceTempWithResolvedPlaylists,
  removePlaylistLibraryTempPlaylists,
  getPlaylistsNotInLibrary
} from 'common/store/playlist-library/helpers'

describe('findInPlaylistLibrary', () => {
  it('finds an index in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const found = findInPlaylistLibrary(library, 2)
    expect(found).toEqual({ type: 'playlist', playlist_id: 2 })
  })

  it('finds an index in the library with folders', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [{ type: 'playlist', playlist_id: 3 }]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const found = findInPlaylistLibrary(library, 3)
    expect(found).toEqual({ type: 'playlist', playlist_id: 3 })
  })

  it('does not find something not in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'fake-uuid',
          contents: [{ type: 'playlist', playlist_id: 3 }]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const found = findInPlaylistLibrary(library, 10)
    expect(found).toEqual(false)
  })
})

describe('findIndexInPlaylistLibrary', () => {
  it('finds an index in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const index = findIndexInPlaylistLibrary(library, 2)
    expect(index).toEqual(1)
  })

  it('does not find something not in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const index = findIndexInPlaylistLibrary(library, 10)
    expect(index).toEqual(-1)
  })

  it('finds folder in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 7 },
            { type: 'playlist', playlist_id: 10 }
          ]
        }
      ]
    }
    const index = findIndexInPlaylistLibrary(library, 'fake-uuid')
    expect(index).toEqual(4)
  })

  it('finds playlist inside folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 7 },
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: '33' },
            {
              type: 'folder',
              name: 'favorites 2',
              id: 'fake-uuid-2',
              contents: [
                { type: 'playlist', playlist_id: 11 },
                { type: 'playlist', playlist_id: 12 },
                { type: 'temp_playlist', playlist_id: 13 }
              ]
            }
          ]
        }
      ]
    }
    let index = findIndexInPlaylistLibrary(library, 7)
    expect(index).toEqual([4, 0])

    index = findIndexInPlaylistLibrary(library, '33')
    expect(index).toEqual([4, 2])

    index = findIndexInPlaylistLibrary(library, 12)
    expect(index).toEqual([4, 3, 1])
  })

  it('finds folder inside folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 7 },
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: '33' },
            {
              type: 'folder',
              name: 'favorites 2',
              id: 'fake-uuid-2',
              contents: [
                { type: 'playlist', playlist_id: 11 },
                { type: 'playlist', playlist_id: 12 },
                { type: 'temp_playlist', playlist_id: 13 }
              ]
            }
          ]
        }
      ]
    }
    const index = findIndexInPlaylistLibrary(library, 'fake-uuid-2')
    expect(index).toEqual([4, 3])
  })
})

describe('removeFromPlaylistLibrary', () => {
  it('removes playlist from the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const { library: ret, removed } = removeFromPlaylistLibrary(library, 2)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    expect(removed).toEqual({ type: 'playlist', playlist_id: 2 })
  })

  it('removes folder from the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        {
          type: 'folder',
          contents: [{ type: 'playlist', playlist_id: 5 }],
          id: 'fake-uuid',
          name: 'Foldar'
        }
      ]
    }
    const { library: ret, removed } = removeFromPlaylistLibrary(
      library,
      'fake-uuid'
    )
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    expect(removed).toEqual({
      type: 'folder',
      contents: [{ type: 'playlist', playlist_id: 5 }],
      id: 'fake-uuid',
      name: 'Foldar'
    })
  })

  it('removes playlist from the library with folders present', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'playlist', playlist_id: 5 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const { library: ret, removed } = removeFromPlaylistLibrary(library, 3)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [{ type: 'playlist', playlist_id: 5 }]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    expect(removed).toEqual({ type: 'playlist', playlist_id: 3 })
  })

  it('does not remove something not in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'playlist', playlist_id: 5 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const { library: ret, removed } = removeFromPlaylistLibrary(library, 100)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'playlist', playlist_id: 5 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    expect(removed).toEqual(null)
  })
})

describe('removePlaylistLibraryDuplicates', () => {
  it('can remove single dupes', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 }
      ]
    }
    const ret = removePlaylistLibraryDuplicates(library)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 }
      ]
    })
  })

  it('does not remove non duplicates', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        { type: 'playlist', playlist_id: 5 },
        { type: 'playlist', playlist_id: 6 }
      ]
    }
    const ret = removePlaylistLibraryDuplicates(library)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        { type: 'playlist', playlist_id: 5 },
        { type: 'playlist', playlist_id: 6 }
      ]
    })
  })

  it('can remove multiple dupes', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 3 }
      ]
    }
    const ret = removePlaylistLibraryDuplicates(library)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 }
      ]
    })
  })

  it('can remove nested dupes', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [
            { type: 'playlist', playlist_id: 2 },
            { type: 'playlist', playlist_id: 3 },
            { type: 'playlist', playlist_id: 5 }
          ]
        },
        { type: 'playlist', playlist_id: 3 }
      ]
    }
    const ret = removePlaylistLibraryDuplicates(library)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [{ type: 'playlist', playlist_id: 5 }]
        }
      ]
    })
  })

  it('can remove dupe folders', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'playlist', playlist_id: 4 },
            { type: 'playlist', playlist_id: 5 },
            { type: 'playlist', playlist_id: 6 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'playlist', playlist_id: 4 },
            { type: 'playlist', playlist_id: 5 },
            { type: 'playlist', playlist_id: 6 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites',
          id: 'different-uuid',
          contents: [
            { type: 'playlist', playlist_id: 4 },
            { type: 'playlist', playlist_id: 5 },
            { type: 'playlist', playlist_id: 6 }
          ]
        }
      ]
    }
    const result = removePlaylistLibraryDuplicates(library)

    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'playlist', playlist_id: 4 },
            { type: 'playlist', playlist_id: 5 },
            { type: 'playlist', playlist_id: 6 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites',
          id: 'different-uuid',
          contents: []
        }
      ]
    }
    expect(result).toEqual(expectedResult)
  })
})

describe('removePlaylistLibraryTempPlaylists', () => {
  it('can remove temporary playlists', () => {
    const library = {
      contents: [
        { type: 'temp_playlist', playlist_id: '33' },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        {
          type: 'folder',
          name: 'My folder',
          id: 'uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '44' },
            { type: 'playlist', playlist_id: 5 },
            { type: 'playlist', playlist_id: 6 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 }
      ]
    }
    const ret = removePlaylistLibraryTempPlaylists(library)
    expect(ret).toEqual({
      contents: [
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        {
          type: 'folder',
          name: 'My folder',
          id: 'uuid',
          contents: [
            { type: 'playlist', playlist_id: 5 },
            { type: 'playlist', playlist_id: 6 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 }
      ]
    })
  })

  it('does not remove non temp playlists', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        {
          type: 'folder',
          name: 'My folder',
          id: 'uuid',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'playlist', playlist_id: 11 }
          ]
        },
        { type: 'playlist', playlist_id: 4 },
        { type: 'playlist', playlist_id: 5 },
        { type: 'playlist', playlist_id: 6 }
      ]
    }
    const ret = removePlaylistLibraryTempPlaylists(library)
    expect(ret).toEqual(library)
  })

  it('can deal with empty library', () => {
    const library = {
      contents: []
    }
    let ret = removePlaylistLibraryTempPlaylists(library)
    expect(ret).toEqual(library)

    library.contents = null
    ret = removePlaylistLibraryTempPlaylists(library)
    expect(ret).toEqual(library)
  })
})

describe('reorderPlaylistLibrary', () => {
  it('can reorder adjacent playlists', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 2, 3)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder the start playlist', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 1, 4)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        { type: 'playlist', playlist_id: 1 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        }
      ]
    })
  })

  it('can reorder the end playlist', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 4, 1)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 4 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 }
      ]
    })
  })

  it('can reorder a playlist inside a folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, '10', 2)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'temp_playlist', playlist_id: '10' },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder a playlist to the beginning', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 3, -1)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder a playlist to a folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'temp_playlist', playlist_id: '100' },
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 3, -1)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'temp_playlist', playlist_id: '100' },
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })

    const ret2 = reorderPlaylistLibrary(ret, '100', '10')
    expect(ret2).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'temp_playlist', playlist_id: '100' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder a playlist inside a folder to another position inside the folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 'Heavy Rotation', 12)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'playlist', playlist_id: 12 },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('does not reorder a playlist to a location outside of the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 3, 10)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('inserts a new playlist that was not in the original order', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 5, 2)
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 5 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    const res2 = reorderPlaylistLibrary(library, 22, 'Heavy Rotation')
    expect(res2).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 22 },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('soft fails if the dragging item is a folder but it is not in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(
      library,
      'not-exist-folder',
      2,
      'playlist-folder'
    )
    expect(ret).toEqual(library)
  })

  it('is a no op if the dragging id and dropping id are the same', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(
      library,
      'my-uuid',
      'my-uuid',
      'playlist-folder'
    )
    expect(ret).toEqual(library)
  })

  it('can reorder a folder to the beginning of the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(
      library,
      'my-uuid',
      -1,
      'playlist-folder'
    )
    expect(ret).toEqual({
      contents: [
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder a folder to the end of the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 'my-uuid', 4, 'playlist-folder')
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        }
      ]
    })
  })

  it('can reorder a folder to the middle of the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(library, 'my-uuid', 3, 'playlist-folder')
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder a playlist or folder after a folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(
      library,
      'my-uuid',
      'my-uuid-2',
      'playlist-folder'
    )
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    const ret2 = reorderPlaylistLibrary(ret, 2, 'my-uuid', 'playlist')
    expect(ret2).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })

  it('can reorder an item before the target item', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = reorderPlaylistLibrary(
      library,
      'my-uuid',
      1,
      'playlist-folder',
      true
    )
    expect(ret).toEqual({
      contents: [
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
    const ret2 = reorderPlaylistLibrary(ret, 1, '10', 'playlist', true)
    expect(ret2).toEqual({
      contents: [
        {
          type: 'folder',
          name: 'favorites',
          id: 'my-uuid',
          contents: [
            { type: 'playlist', playlist_id: 1 },
            { type: 'temp_playlist', playlist_id: '10' },
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 12 }
          ]
        },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites 2',
          id: 'my-uuid-2',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Best New Releases' },
            { type: 'playlist', playlist_id: 120 }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'playlist', playlist_id: 4 }
      ]
    })
  })
})

describe('containsTempPlaylist', () => {
  it('finds a temp', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    const ret = containsTempPlaylist(library)
    expect(ret).toEqual(true)
  })

  it('finds a temp in a folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'favorites',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        },
        { type: 'playlist', playlist_id: 4 }
      ]
    }
    const ret = containsTempPlaylist(library)
    expect(ret).toEqual(true)
  })

  it('finds no temp', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 }
      ]
    }
    const ret = containsTempPlaylist(library)
    expect(ret).toEqual(false)
  })
})

describe('addFolderToLibrary', () => {
  it('Adds a new folder to the end of a playlist library and returns the result', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    const folder = {
      id: 'fake-uuid',
      name: 'Foldero',
      contents: [],
      type: 'folder'
    }
    const result = addFolderToLibrary(library, folder)
    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' },
        {
          id: 'fake-uuid',
          name: 'Foldero',
          contents: [],
          type: 'folder'
        }
      ]
    }
    expect(result).toEqual(expectedResult)
  })

  it('works with a null library', () => {
    const library = null
    const folder = {
      id: 'fake-uuid',
      name: 'Foldero',
      contents: [],
      type: 'folder'
    }
    const result = addFolderToLibrary(library, folder)
    const expectedResult = {
      contents: [
        {
          id: 'fake-uuid',
          name: 'Foldero',
          contents: [],
          type: 'folder'
        }
      ]
    }
    expect(result).toEqual(expectedResult)
  })

  it('works with an empty library', () => {
    const emptyLibrary1 = {
      contents: []
    }
    const folder = {
      id: 'fake-uuid',
      name: 'Foldero',
      contents: [],
      type: 'folder'
    }
    const result1 = addFolderToLibrary(emptyLibrary1, folder)
    const expectedResult1 = {
      contents: [
        {
          id: 'fake-uuid',
          name: 'Foldero',
          contents: [],
          type: 'folder'
        }
      ]
    }
    expect(result1).toEqual(expectedResult1)

    const emptyLibrary2 = null
    const result2 = addFolderToLibrary(emptyLibrary2, folder)
    const expectedResult2 = {
      contents: [
        {
          id: 'fake-uuid',
          name: 'Foldero',
          contents: [],
          type: 'folder'
        }
      ]
    }
    expect(result2).toEqual(expectedResult2)
  })
})

describe('renamePlaylistFolderInLibrary', () => {
  it('changes the name of given folder in library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'folder', name: 'Foldero', id: 'fake-uuid', contents: [] },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }

    const result = renamePlaylistFolderInLibrary(
      library,
      'fake-uuid',
      'Foldera'
    )
    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          id: 'fake-uuid',
          name: 'Foldera',
          contents: [],
          type: 'folder'
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    expect(result).toEqual(expectedResult)
  })

  it('is a no op if the given folder is not in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'folder', name: 'Foldero', id: 'fake-uuid', contents: [] },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    const result = renamePlaylistFolderInLibrary(
      library,
      'fake-uuid-not-in-library',
      'new name'
    )
    expect(result).toEqual({ ...library })
  })
})

describe('removePlaylistFolderInLibrary', () => {
  it('removes folder from library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'folder', name: 'Foldero', id: 'fake-uuid', contents: [] },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }

    const result = removePlaylistFolderInLibrary(library, 'fake-uuid')
    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    expect(result).toEqual(expectedResult)
  })

  it('moves contents of folder to upper level before deleting', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 4 },
            { type: 'playlist', playlist_id: 5 },
            { type: 'temp_playlist', playlist_id: 'ghji' },
            {
              type: 'folder',
              name: 'Folderino',
              id: 'fake-uuid-2',
              contents: []
            }
          ]
        },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    const result = removePlaylistFolderInLibrary(library, 'fake-uuid')
    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'playlist', playlist_id: 4 },
        { type: 'playlist', playlist_id: 5 },
        { type: 'temp_playlist', playlist_id: 'ghji' },
        { type: 'folder', name: 'Folderino', id: 'fake-uuid-2', contents: [] },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    expect(result).toEqual(expectedResult)
  })

  it('is a no op if the given folder is not in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'folder', name: 'Foldero', id: 'fake-uuid', contents: [] },
        { type: 'playlist', playlist_id: 3 },
        { type: 'temp_playlist', playlist_id: 'asdf' }
      ]
    }
    const result = removePlaylistFolderInLibrary(
      library,
      'fake-uuid-not-in-library'
    )
    expect(result).toEqual({ ...library })
  })
})

describe('addPlaylistToFolder', () => {
  it('adds playlist to given folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        }
      ]
    }

    const result = addPlaylistToFolder(library, 'Heavy Rotation', 'fake-uuid')
    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        }
      ]
    }
    expect(result).toEqual(expectedResult)
  })

  it('returns the original unchanged library if the playlist is already in the folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        }
      ]
    }

    const result = addPlaylistToFolder(library, 'asdf', 'fake-uuid')
    expect(result).toBe(library)
  })

  it('returns the original unchanged library if folder does not exist', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        }
      ]
    }

    const result = addPlaylistToFolder(
      library,
      'Heavy Rotation',
      'uuid-doesnt-exist'
    )
    expect(result).toBe(library)
  })

  it('returns the original unchanged library if the library has no contents', () => {
    const library = {}

    const result = addPlaylistToFolder(library, 'Heavy Rotation', 'fake-uuid')
    expect(result).toBe(library)
  })

  it('moves the playlist into the folder if the playlist is already in the library but not in the folder', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        }
      ]
    }

    const result = addPlaylistToFolder(library, 2, 'fake-uuid')
    const expectedResult = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        {
          type: 'folder',
          name: 'Foldero',
          id: 'fake-uuid',
          contents: [
            { type: 'playlist', playlist_id: 2 },
            { type: 'playlist', playlist_id: 3 },
            { type: 'temp_playlist', playlist_id: 'asdf' }
          ]
        }
      ]
    }
    expect(result).toEqual(expectedResult)
  })
})

describe('extractTempPlaylistsFromLibrary', () => {
  it('returns all temp playlists in library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'temp_playlist', playlist_id: 'e' },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: 'a' },
            { type: 'temp_playlist', playlist_id: 'b' },
            { type: 'playlist', playlist_id: 11 },
            { type: 'temp_playlist', playlist_id: 'c' },
            { type: 'temp_playlist', playlist_id: 'd' }
          ]
        }
      ]
    }
    const ret = extractTempPlaylistsFromLibrary(library)
    expect(ret).toEqual([
      { type: 'temp_playlist', playlist_id: 'e' },
      { type: 'temp_playlist', playlist_id: 'a' },
      { type: 'temp_playlist', playlist_id: 'b' },
      { type: 'temp_playlist', playlist_id: 'c' },
      { type: 'temp_playlist', playlist_id: 'd' }
    ])
  })

  it('can deal with empty libraries', () => {
    const ret = extractTempPlaylistsFromLibrary({
      contents: []
    })
    expect(ret).toEqual([])

    const ret2 = extractTempPlaylistsFromLibrary({})
    expect(ret2).toEqual([])
  })

  it('returns empty array if no temp playlists in library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'playlist', playlist_id: 11 }
          ]
        }
      ]
    }
    const ret = extractTempPlaylistsFromLibrary(library)
    expect(ret).toEqual([])
  })
})

describe('replaceTempWithResolvedPlaylists', () => {
  it('returns all temp playlists in library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'temp_playlist', playlist_id: 'e' },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: 'a' },
            { type: 'temp_playlist', playlist_id: 'b' },
            { type: 'playlist', playlist_id: 11 },
            { type: 'temp_playlist', playlist_id: 'c' },
            { type: 'temp_playlist', playlist_id: 'd' }
          ]
        }
      ]
    }
    const tempPlaylistIdToResolvedPlaylist = {
      e: { type: 'playlist', playlist_id: 12 },
      a: { type: 'playlist', playlist_id: 13 },
      b: { type: 'playlist', playlist_id: 14 },
      c: { type: 'playlist', playlist_id: 15 },
      d: { type: 'playlist', playlist_id: 16 }
    }

    const ret = replaceTempWithResolvedPlaylists(
      library,
      tempPlaylistIdToResolvedPlaylist
    )
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'playlist', playlist_id: 12 },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'playlist', playlist_id: 13 },
            { type: 'playlist', playlist_id: 14 },
            { type: 'playlist', playlist_id: 11 },
            { type: 'playlist', playlist_id: 15 },
            { type: 'playlist', playlist_id: 16 }
          ]
        }
      ]
    })
  })

  it('can deal with empty libraries', () => {
    const ret = replaceTempWithResolvedPlaylists(
      {
        contents: []
      },
      {}
    )
    expect(ret).toEqual({
      contents: []
    })

    const ret2 = replaceTempWithResolvedPlaylists({})
    expect(ret2).toEqual({})
  })

  it('can deal with empty folders', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'temp_playlist', playlist_id: 'e' },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: 'a' },
            { type: 'temp_playlist', playlist_id: 'b' },
            { type: 'playlist', playlist_id: 11 },
            { type: 'temp_playlist', playlist_id: 'c' },
            { type: 'temp_playlist', playlist_id: 'd' }
          ]
        },
        { type: 'folder', id: 'my id 2', name: 'Favorites 2', contents: [] }
      ]
    }
    const tempPlaylistIdToResolvedPlaylist = {
      e: { type: 'playlist', playlist_id: 12 },
      a: { type: 'playlist', playlist_id: 13 },
      b: { type: 'playlist', playlist_id: 14 },
      c: { type: 'playlist', playlist_id: 15 },
      d: { type: 'playlist', playlist_id: 16 }
    }

    const ret = replaceTempWithResolvedPlaylists(
      library,
      tempPlaylistIdToResolvedPlaylist
    )
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'playlist', playlist_id: 12 },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'playlist', playlist_id: 13 },
            { type: 'playlist', playlist_id: 14 },
            { type: 'playlist', playlist_id: 11 },
            { type: 'playlist', playlist_id: 15 },
            { type: 'playlist', playlist_id: 16 }
          ]
        },
        { type: 'folder', id: 'my id 2', name: 'Favorites 2', contents: [] }
      ]
    })
  })

  it('can deal with missing temp playlist mapping', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'temp_playlist', playlist_id: 'e' },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: 'a' },
            { type: 'temp_playlist', playlist_id: 'b' },
            { type: 'playlist', playlist_id: 11 },
            { type: 'temp_playlist', playlist_id: 'c' },
            { type: 'temp_playlist', playlist_id: 'd' }
          ]
        }
      ]
    }
    const tempPlaylistIdToResolvedPlaylist = {
      e: { type: 'playlist', playlist_id: 12 },
      b: { type: 'playlist', playlist_id: 14 },
      c: { type: 'playlist', playlist_id: 15 },
      d: { type: 'playlist', playlist_id: 16 }
    }

    const ret = replaceTempWithResolvedPlaylists(
      library,
      tempPlaylistIdToResolvedPlaylist
    )
    expect(ret).toEqual({
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'playlist', playlist_id: 12 },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'temp_playlist', playlist_id: 'a' },
            { type: 'playlist', playlist_id: 14 },
            { type: 'playlist', playlist_id: 11 },
            { type: 'playlist', playlist_id: 15 },
            { type: 'playlist', playlist_id: 16 }
          ]
        }
      ]
    })
  })
})

describe('getPlaylistsNotInLibrary', () => {
  it('returns the playlists that are not already in the library', () => {
    const library = {
      contents: [
        { type: 'playlist', playlist_id: 1 },
        { type: 'playlist', playlist_id: 2 },
        { type: 'explore_playlist', playlist_id: 'Heavy Rotation' },
        { type: 'temp_playlist', playlist_id: 'e' },
        {
          type: 'folder',
          id: 'my id',
          name: 'Favorites',
          contents: [
            { type: 'playlist', playlist_id: 10 },
            { type: 'playlist', playlist_id: 11 },
            { type: 'temp_playlist', playlist_id: 'd' }
          ]
        }
      ]
    }
    const playlists = {
      1: {
        id: 1,
        is_album: false,
        name: 'test',
        user: {
          handle: 'nikki',
          id: 49408
        }
      },
      2: {
        id: 2,
        is_album: false,
        name: 'test',
        user: {
          handle: 'nikki',
          id: 49408
        }
      },
      10: {
        id: 10,
        is_album: false,
        name: 'ten',
        user: {
          handle: 'nikki',
          id: 49408
        }
      },
      11: {
        id: 11,
        is_album: false,
        name: 'eleven',
        user: {
          handle: 'nikki',
          id: 49408
        }
      },
      12: {
        id: 12,
        is_album: false,
        name: 'twelve',
        user: {
          handle: 'nikki',
          id: 49408
        }
      }
    }

    const ret = getPlaylistsNotInLibrary(library, playlists)
    expect(ret).toEqual({
      12: {
        id: 12,
        is_album: false,
        name: 'twelve',
        user: {
          handle: 'nikki',
          id: 49408
        }
      }
    })
  })
})
