import type { ReactNode } from 'react'
import { useCallback } from 'react'

import { SquareSizes } from '@audius/common'
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native'
import { useDispatch } from 'react-redux'

import IconArrow from 'app/assets/images/iconArrow.svg'
import { CollectionImage } from 'app/components/image/CollectionImage'
import { TrackImage } from 'app/components/image/TrackImage'
import { UserImage } from 'app/components/image/UserImage'
import UserBadges from 'app/components/user-badges/UserBadges'
import { useNavigation } from 'app/hooks/useNavigation'
import { addItem } from 'app/store/search/slice'
import type {
  SearchPlaylist,
  SearchTrack,
  SearchUser,
  SectionHeader
} from 'app/store/search/types'
import { useColor, useTheme } from 'app/utils/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    height: 58
  },
  name: {
    fontSize: 14,
    fontFamily: 'AvenirNextLTPro-Medium'
  },
  badgeContainer: {
    flex: 1
  },
  nameContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  userImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginRight: 12
  },
  squareImage: {
    borderRadius: 4,
    height: 40,
    width: 40,
    marginRight: 12
  }
})

type ItemContainerProps = {
  isLast: boolean
  onPress: () => void
  children?: ReactNode
}

const ItemContainer: React.FunctionComponent<ItemContainerProps> = ({
  isLast,
  onPress,
  children
}) => {
  const color = useColor('neutralLight4')
  const backgroundColor = useColor('neutralLight8')
  const containerStyle = useTheme(styles.container, {
    borderBottomColor: 'neutralLight8'
  })
  const viewStyle = isLast ? styles.container : containerStyle
  return (
    <TouchableHighlight underlayColor={backgroundColor} onPress={onPress}>
      <View style={viewStyle}>
        {children}
        <IconArrow fill={color} height={18} width={18} />
      </View>
    </TouchableHighlight>
  )
}

type UserSearchResultProps = { isLast: boolean; item: SearchUser }

const UserSearchResult = ({ isLast, item: user }: UserSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const imageStyle = useTheme(styles.userImage, {
    backgroundColor: 'neutralLight4'
  })
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: user.name }))
    navigation.push('Profile', { handle: user.handle })
  }, [user, navigation, dispatch])

  return (
    <ItemContainer isLast={isLast} onPress={handlePress}>
      <UserImage
        user={user}
        styles={{ image: imageStyle, root: imageStyle }}
        size={SquareSizes.SIZE_150_BY_150}
      />
      <UserBadges
        style={styles.badgeContainer}
        nameStyle={nameStyle}
        user={user}
      />
    </ItemContainer>
  )
}

type TrackSearchResultProps = { isLast: boolean; item: SearchTrack }
const TrackSearchResult = ({ isLast, item: track }: TrackSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const userNameStyle = useTheme(styles.name, { color: 'neutralLight4' })
  const squareImageStyles = useTheme(styles.squareImage, {
    backgroundColor: 'neutralLight4'
  })

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: track.title }))
    navigation.push('Track', {
      id: track.track_id,
      searchTrack: track,
      canBeUnlisted: false
    })
  }, [track, navigation, dispatch])

  return (
    <ItemContainer isLast={isLast} onPress={handlePress}>
      <TrackImage
        track={track}
        size={SquareSizes.SIZE_150_BY_150}
        user={track.user}
        styles={{ root: squareImageStyles, image: squareImageStyles }}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={nameStyle}>
          {track.title}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={userNameStyle}
          user={track.user}
        />
      </View>
    </ItemContainer>
  )
}

type PlaylistSearchResultProps = { isLast: boolean; item: SearchPlaylist }
const PlaylistSearchResult = ({
  isLast,
  item: playlist
}: PlaylistSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const userNameStyle = useTheme(styles.name, { color: 'neutralLight4' })
  const squareImageStyles = useTheme(styles.squareImage, {
    backgroundColor: 'neutralLight4'
  })

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: playlist.playlist_name }))
    navigation.push('Collection', {
      id: playlist.playlist_id,
      searchCollection: playlist
    })
  }, [playlist, navigation, dispatch])

  return (
    <ItemContainer isLast={isLast} onPress={handlePress}>
      <CollectionImage
        collection={playlist}
        size={SquareSizes.SIZE_150_BY_150}
        user={playlist.user}
        styles={{ root: squareImageStyles, image: squareImageStyles }}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={nameStyle}>
          {playlist.playlist_name}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={userNameStyle}
          user={playlist.user}
        />
      </View>
    </ItemContainer>
  )
}

type AlbumSearchResultProps = { isLast: boolean; item: SearchPlaylist }
const AlbumSearchResult = ({ isLast, item: album }: AlbumSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const userNameStyle = useTheme(styles.name, { color: 'neutralLight4' })
  const squareImageStyles = useTheme(styles.squareImage, {
    backgroundColor: 'neutralLight4'
  })

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: album.playlist_name }))
    navigation.push('Collection', {
      id: album.playlist_id,
      searchCollection: album
    })
  }, [album, navigation, dispatch])

  return (
    <ItemContainer isLast={isLast} onPress={handlePress}>
      <CollectionImage
        collection={album}
        size={SquareSizes.SIZE_150_BY_150}
        user={album.user}
        styles={{ root: squareImageStyles, image: squareImageStyles }}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={nameStyle}>
          {album.playlist_name}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={userNameStyle}
          user={album.user}
        />
      </View>
    </ItemContainer>
  )
}

type SearchItemProps = {
  isLast: boolean
  type: SectionHeader
  item: SearchUser | SearchTrack | SearchPlaylist
}
const SearchItem = ({ isLast, type, item }: SearchItemProps) => {
  switch (type) {
    case 'users':
      return <UserSearchResult isLast={isLast} item={item as SearchUser} />
    case 'tracks':
      return <TrackSearchResult isLast={isLast} item={item as SearchTrack} />
    case 'playlists':
      return (
        <PlaylistSearchResult isLast={isLast} item={item as SearchPlaylist} />
      )
    case 'albums':
      return <AlbumSearchResult isLast={isLast} item={item as SearchPlaylist} />
    default:
      return null
  }
}

export default SearchItem
