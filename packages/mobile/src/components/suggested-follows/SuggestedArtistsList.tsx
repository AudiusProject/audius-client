import { useCallback } from 'react'

import type { CommonState, ID, Maybe } from '@audius/common'
import { useProxySelector, removeNullable } from '@audius/common'
import {
  removeFollowArtists,
  addFollowArtists
} from 'common/store/pages/signon/actions'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch, useSelector } from 'react-redux'

import { ProfileCard, ProfileList } from 'app/components/profile-list'
import type { AppState } from 'app/store'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const useStyles = makeStyles(({ palette }) => ({
  activeText: {
    color: palette.staticWhite
  }
}))

export const SuggestedArtistsList = () => {
  const styles = useStyles()
  const { secondaryLight2, secondaryDark2, white } = useThemeColors()
  const dispatch = useDispatch()

  const suggestedArtists = useProxySelector((state: AppState & CommonState) => {
    const { categories, selectedCategory } = state.signOn.followArtists
    const suggestedFollowsForCategory: Maybe<ID[]> =
      categories[selectedCategory]
    const users = state.users.entries

    return suggestedFollowsForCategory
      ?.map((suggestedUserId) => users[suggestedUserId].metadata)
      .filter(removeNullable)
  }, [])

  const selectedArtistIds: ID[] = useSelector(
    (state: AppState) => state.signOn.followArtists.selectedUserIds
  )

  const handleSelectArtist = useCallback(
    (userId: number) => {
      const isSelected = selectedArtistIds.includes(userId)
      if (isSelected) {
        dispatch(removeFollowArtists([userId]))
      } else {
        dispatch(addFollowArtists([userId]))
      }
    },
    [selectedArtistIds, dispatch]
  )

  return (
    <ProfileList
      profiles={suggestedArtists}
      renderItem={({ item: artist }) => {
        const { user_id } = artist
        const isSelected = selectedArtistIds.includes(user_id)
        const gradientColors = isSelected
          ? [secondaryLight2, secondaryDark2]
          : [white, white]

        const textStyles = isSelected
          ? {
              primaryText: styles.activeText,
              secondaryText: styles.activeText
            }
          : undefined

        return (
          <ProfileCard
            profile={artist}
            onPress={() => handleSelectArtist(user_id)}
            TileProps={{ as: LinearGradient, colors: gradientColors }}
            styles={textStyles}
          />
        )
      }}
    />
  )
}
