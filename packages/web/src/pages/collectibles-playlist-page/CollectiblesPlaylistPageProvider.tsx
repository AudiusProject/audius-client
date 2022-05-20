import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'

import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'
import { matchPath } from 'react-router-dom'

import { useModalState } from 'common/hooks/useModalState'
import { ShareSource } from 'common/models/Analytics'
import { Chain } from 'common/models/Chain'
import { Collectible } from 'common/models/Collectible'
import { SmartCollectionVariant } from 'common/models/SmartCollectionVariant'
import Status from 'common/models/Status'
import { User } from 'common/models/User'
import { getUser } from 'common/store/cache/users/selectors'
import {
  CollectionTrack,
  TrackRecord
} from 'common/store/pages/collection/types'
import { fetchProfile } from 'common/store/pages/profile/actions'
import { add, clear, pause, play } from 'common/store/queue/slice'
import { Source } from 'common/store/queue/types'
import { setCollectible } from 'common/store/ui/collectible-details/slice'
import { requestOpen as requestOpenShareModal } from 'common/store/ui/share-modal/slice'
import { formatSeconds } from 'common/utils/timeUtil'
import TablePlayButton from 'components/tracks-table/TablePlayButton'
import { AUDIO_NFT_PLAYLIST } from 'pages/smart-collection/smartCollections'
import { getPlaying, makeGetCurrent } from 'store/player/selectors'
import { getLocationPathname } from 'store/routing/selectors'
import { AppState } from 'store/types'
import { getHash, AUDIO_NFT_PLAYLIST_PAGE, profilePage } from 'utils/route'

import { CollectionPageProps as DesktopCollectionPageProps } from '../collection-page/components/desktop/CollectionPage'
import { CollectionPageProps as MobileCollectionPageProps } from '../collection-page/components/mobile/CollectionPage'

import styles from './CollectiblesPlaylistPage.module.css'

type CollectiblesPlaylistPageProviderProps = {
  children:
    | React.ComponentType<MobileCollectionPageProps>
    | React.ComponentType<DesktopCollectionPageProps>
}

const chainLabelMap: Record<Chain, string> = {
  [Chain.Eth]: 'Ethereum',
  [Chain.Sol]: 'Solana'
}

const hasAudio = (video: HTMLMediaElement) => {
  if (typeof video.webkitAudioDecodedByteCount !== 'undefined') {
    // non-zero if video has audio track
    if (video.webkitAudioDecodedByteCount > 0) return true
    else return false
  } else if (typeof video.mozHasAudio !== 'undefined') {
    // true if video has audio track
    if (video.mozHasAudio) return true
    else return false
  } else return false
}

const getCurrent = makeGetCurrent()

export const CollectiblesPlaylistPageProvider = ({
  children: Children
}: CollectiblesPlaylistPageProviderProps) => {
  const dispatch = useDispatch()
  const currentPlayerItem = useSelector(getCurrent)
  const playing = useSelector(getPlaying)

  // Getting user data
  const pathname = useSelector(getLocationPathname)
  const routeMatch = useMemo(
    () =>
      matchPath<{ handle: string }>(pathname, {
        path: AUDIO_NFT_PLAYLIST_PAGE,
        exact: true
      }),
    [pathname]
  )

  const user = useSelector<AppState, User | null>(state =>
    getUser(state, { handle: routeMatch?.params.handle ?? null })
  )
  const collectibleIds = Object.keys(user?.collectibles ?? {})
  const order = user?.collectibles?.order ?? []

  const [audioCollectibles, setAudioCollectibles] = useState<Collectible[]>([])
  const [fetchResolved, setFetchResolved] = useState(false)
  const hasFetchedCollectibles = useRef(false)
  useEffect(() => {
    const asyncFn = async () => {
      if (collectibleIds && !hasFetchedCollectibles.current) {
        const mappedAudioCollectibles = await Promise.all(
          [
            ...(user?.collectibleList ?? []),
            ...(user?.solanaCollectibleList ?? [])
          ]
            .filter(c =>
              collectibleIds.length ? collectibleIds.includes(c.id) : true
            )
            // Sort by user collectibles order
            .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
            // Filter to audio nfts
            .filter(c =>
              ['mp3', 'wav', 'oga', 'mp4'].some(
                ext => c.hasAudio || c.animationUrl?.endsWith(ext)
              )
            )
            // Calculate duration
            .map(async collectible => {
              if (!collectible.animationUrl) return collectible

              if (
                ['mp3', 'wav', 'oga'].some(ext =>
                  collectible.animationUrl?.endsWith(ext)
                )
              ) {
                const a = new Audio()
                // Only fetch the metadata
                a.preload = 'metadata'
                a.src = collectible.animationUrl
                const duration: number = await new Promise(resolve => {
                  a.onloadedmetadata = () => {
                    resolve(a.duration)
                  }
                })
                collectible.duration = duration
              }

              if (
                ['mp4'].some(ext => collectible.animationUrl?.endsWith(ext)) &&
                // Check for window.document because video will not be available
                // otherwise.
                window &&
                window.document
              ) {
                const v = document.createElement('video')
                // Only fetch the metadata
                v.src = collectible.animationUrl
                v.muted = true
                v.preload = 'metadata'
                const duration: number = await new Promise(resolve => {
                  v.onloadedmetadata = () => {
                    resolve(v.duration)
                  }
                })
                v.play()
                await new Promise(resolve => setTimeout(resolve, 200))
                const videoHasAudio = hasAudio(v)
                if (!videoHasAudio) {
                  return null
                }
                collectible.duration = duration
              }
              return collectible
            })
        )
        const filteredAudioCollectibles = mappedAudioCollectibles.filter(
          removeNullable
        )
        if (filteredAudioCollectibles.length) {
          hasFetchedCollectibles.current = true
          setAudioCollectibles(filteredAudioCollectibles)
        }
        if (!fetchResolved && user?.collectibleList) {
          setFetchResolved(true)
        }
      }
    }
    asyncFn()
  }, [
    order,
    collectibleIds,
    user,
    setAudioCollectibles,
    hasFetchedCollectibles,
    fetchResolved
  ])

  const title = `${user?.name} ${SmartCollectionVariant.AUDIO_NFT_PLAYLIST}`

  useEffect(() => {
    if (routeMatch?.params.handle) {
      dispatch(
        fetchProfile(routeMatch.params.handle, null, false, false, false, true)
      )
    }
  }, [dispatch, routeMatch])

  const tracksLoading = !fetchResolved

  const isPlayingACollectible = useMemo(
    () =>
      audioCollectibles.some(
        collectible => collectible.id === currentPlayerItem?.collectible?.id
      ),
    [audioCollectibles, currentPlayerItem]
  )

  const entries = audioCollectibles.map(collectible => ({
    track_id: collectible.id,
    id: collectible.id,
    uid: collectible.id,
    artistId: user?.user_id,
    collectible,
    title: collectible.name,
    source: Source.COLLECTIBLE_PLAYLIST_TRACKS
  }))

  const onClickRow = (collectible: Collectible, index: number) => {
    if (playing && collectible.id === currentPlayerItem?.collectible?.id) {
      dispatch(pause({}))
    } else if (collectible.id === currentPlayerItem?.collectible?.id) {
      dispatch(play({}))
    } else {
      if (!isPlayingACollectible) {
        dispatch(clear({}))
        dispatch(add({ entries }))
      }
      dispatch(play({ collectible }))
    }
  }

  const [, setIsDetailsModalOpen] = useModalState('CollectibleDetails')

  const onClickTrackName = (collectible: Collectible) => {
    dispatch(
      setCollectible({
        collectible: collectible,
        ownerHandle: user?.handle,
        embedCollectibleHash: getHash(collectible.id),
        isUserOnTheirProfile: false
      })
    )
    setIsDetailsModalOpen(true)
  }

  const onHeroTrackClickArtistName = () => {
    if (user) dispatch(push(profilePage(user?.handle)))
  }

  const handlePlayAllClick = () => {
    if (playing && isPlayingACollectible) {
      dispatch(pause({}))
    } else if (isPlayingACollectible) {
      dispatch(play({}))
    } else {
      dispatch(clear({}))
      dispatch(
        add({
          entries,
          index: 0
        })
      )
      dispatch(play({ collectible: audioCollectibles[0] }))
    }
  }

  const getPlayingUid = useCallback(() => {
    return currentPlayerItem.uid
      ? currentPlayerItem.uid
      : currentPlayerItem.collectible
      ? currentPlayerItem.collectible.id
      : null
  }, [currentPlayerItem])

  const formatMetadata = useCallback(
    (trackMetadatas: CollectionTrack[]): TrackRecord[] => {
      return trackMetadatas.map((metadata, i) => ({
        ...metadata,
        ...metadata.collectible,
        key: `${metadata.collectible.name}_${metadata.uid}_${i}`,
        name: metadata.collectible.name,
        artist: '',
        handle: '',
        date: metadata.dateAdded || metadata.created_at,
        time: 0,
        plays: 0
      }))
    },
    []
  )

  const getFilteredData = useCallback(
    (trackMetadatas: CollectionTrack[]) => {
      const playingUid = getPlayingUid()
      const playingIndex = entries.findIndex(({ uid }) => uid === playingUid)
      const formattedMetadata = formatMetadata(trackMetadatas)
      const filteredIndex =
        playingIndex > -1
          ? formattedMetadata.findIndex(metadata => metadata.uid === playingUid)
          : playingIndex
      return [formattedMetadata, filteredIndex] as [
        typeof formattedMetadata,
        number
      ]
    },
    [getPlayingUid, formatMetadata, entries]
  )

  const isQueued = useCallback(() => {
    return entries.some(
      entry => currentPlayerItem?.collectible?.id === entry.id
    )
  }, [entries, currentPlayerItem])

  const columns = [
    {
      title: '',
      key: 'playButton',
      className: 'colCollectiblesPlayButton',
      render: (val: string, record: Collectible, index: number) => (
        <TablePlayButton
          paused={!playing}
          playing={record.id === currentPlayerItem?.collectible?.id}
          className={styles.playButtonFormatting}
        />
      )
    },
    {
      title: 'Track Name',
      dataIndex: 'name',
      key: 'name',
      className: 'colTrackName',
      width: '70%',
      render: (val: string, record: Collectible) => (
        <div
          className={cn(styles.collectibleName, {
            [styles.active]: record.id === currentPlayerItem?.collectible?.id
          })}
          onClick={e => {
            e.stopPropagation()
            onClickTrackName(record)
          }}
        >
          {val}
        </div>
      )
    },
    {
      title: 'Chain',
      dataIndex: 'chain',
      key: 'chain',
      className: 'colChain',
      render: (val: string, record: Collectible) => (
        <div>{chainLabelMap[record.chain]}</div>
      )
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      className: 'colTime',
      render: (val: string, record: Collectible) => (
        <div>{formatSeconds(record.duration || 0)}</div>
      )
    }
  ]

  const onHeroTrackShare = () => {
    if (user) {
      dispatch(
        requestOpenShareModal({
          type: 'audioNftPlaylist',
          userId: user?.user_id,
          source: ShareSource.TILE
        })
      )
    }
  }

  const metadata = {
    ...AUDIO_NFT_PLAYLIST,
    playlist_name: title,
    description: AUDIO_NFT_PLAYLIST.makeDescription?.(user?.name) ?? '',
    playlist_contents: {
      track_ids: entries.map(entry => ({ track: entry.id }))
    },
    imageOverride:
      audioCollectibles?.[0]?.imageUrl ??
      audioCollectibles?.[0]?.frameUrl ??
      audioCollectibles?.[0]?.gifUrl,
    typeTitle: 'Audio NFT Playlist'
  }

  const childProps = {
    title,
    description: '',
    canonicalUrl: '',
    playlistId: SmartCollectionVariant.AUDIO_NFT_PLAYLIST,
    playing,
    type: 'playlist',
    collection: {
      status: tracksLoading ? Status.LOADING : Status.SUCCESS,
      metadata,
      user
    },
    tracks: {
      status: tracksLoading ? Status.LOADING : Status.SUCCESS,
      entries
    },
    columns,
    getPlayingUid: getPlayingUid,
    getFilteredData: getFilteredData,
    isQueued: isQueued,

    onPlay: handlePlayAllClick,
    onHeroTrackShare,
    onClickRow,
    onClickTrackName,
    onHeroTrackClickArtistName
  }

  return <Children {...childProps} />
}
