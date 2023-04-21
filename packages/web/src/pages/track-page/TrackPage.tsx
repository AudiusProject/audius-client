import { connect } from 'react-redux'

import { AppState } from 'store/types'
import { isMobile } from 'utils/clientUtil'

import TrackPageProvider from './TrackPageProvider'
import TrackPageDesktopContent from './components/desktop/TrackPage'
import TrackPageMobileContent from './components/mobile/TrackPage'

interface OwnProps {}

type TrackPageContentProps = ReturnType<typeof mapStateToProps> & OwnProps

const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([])

const TrackPage = ({ isMobile }: TrackPageContentProps) => {
  const content = isMobile ? TrackPageMobileContent : TrackPageDesktopContent

  return <TrackPageProvider>{content}</TrackPageProvider>
}

function mapStateToProps(state: AppState) {
  return {
    isMobile: isMobile()
  }
}

const FeaturedPlaylists: React.FC<{ playlists: Playlist[] }> = ({ playlists }) => {
  if (playlists.length === 0) {
    return null;
  }
  return (
    <div className={styles.featuredPlaylists}>
      <h3>Featured in these playlists:</h3>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.playlist_id}>
            <a href={`/playlist/${playlist.playlist_id}`}>{playlist.playlist_name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default connect(mapStateToProps)(TrackPage)
