import { ShareToTwitter } from 'common/models/Analytics'
import { ShareModalContent } from 'common/store/ui/share-modal/types'
import {
  fullAlbumPage,
  fullPlaylistPage,
  fullProfilePage,
  fullTrackPage
} from 'utils/route'

type ShareToTwitterEvent = Omit<ShareToTwitter, 'eventName' | 'source'>

export const getTwitterShareText = (content: ShareModalContent) => {
  let twitterText = ''
  let link = ''
  let analyticsEvent: ShareToTwitterEvent
  switch (content.type) {
    case 'track': {
      const { track, artist } = content
      twitterText = `Check out ${track.title} by ${artist.handle} on @AudiusProject #Audius`
      link = fullTrackPage(track.permalink)
      analyticsEvent = { kind: 'track', id: track.track_id, url: link }
      break
    }
    case 'profile': {
      const { profile } = content
      twitterText = `Check out ${profile.handle} on @AudiusProject #Audius`
      link = fullProfilePage(profile.handle)
      analyticsEvent = { kind: 'profile', id: profile.user_id, url: link }
      break
    }
    case 'album': {
      const {
        album: { playlist_name, playlist_id },
        artist: { handle }
      } = content
      twitterText = `Check out ${playlist_name} by ${handle} @AudiusProject #Audius`
      link = fullAlbumPage(handle, playlist_name, playlist_id)
      analyticsEvent = { kind: 'album', id: playlist_id, url: link }
      break
    }
    case 'playlist': {
      const {
        playlist: { playlist_name, playlist_id },
        creator: { handle }
      } = content
      twitterText = `Check out ${playlist_name} by ${handle} @AudiusProject #Audius`
      link = fullPlaylistPage(handle, playlist_name, playlist_id)
      analyticsEvent = { kind: 'playlist', id: playlist_id, url: link }
      break
    }
  }

  return { twitterText, link, analyticsEvent }
}
