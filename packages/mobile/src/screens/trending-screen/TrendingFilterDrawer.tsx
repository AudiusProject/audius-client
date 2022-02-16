import { useCallback, useMemo, useState } from 'react'

import { setTrendingGenre } from 'audius-client/src/common/store/pages/trending/actions'
import {
  trendingWeekActions,
  trendingMonthActions,
  trendingAllTimeActions
} from 'audius-client/src/common/store/pages/trending/lineup/actions'
import { getTrendingGenre } from 'audius-client/src/common/store/pages/trending/selectors'
import {
  getModalVisibility,
  setVisibility
} from 'audius-client/src/common/store/ui/modals/slice'
import {
  ELECTRONIC_PREFIX,
  ELECTRONIC_SUBGENRES,
  Genre,
  GENRES
} from 'audius-client/src/common/utils/genres'
import { FlatList, View } from 'react-native'

import { SearchInput, Button } from 'app/components/core'
import Drawer from 'app/components/drawer'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

export const MODAL_NAME = 'TrendingGenreSelection'

const messages = {
  title: 'Pick a Genre',
  all: 'All Genres',
  searchPlaceholder: 'Search Genres'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    paddingHorizontal: spacing(3),
    flex: 1
  },
  search: {
    marginBottom: spacing(2)
  },
  genreButton: {
    marginVertical: spacing(1)
  }
}))

export const TrendingFilterDrawer = () => {
  const styles = useStyles()
  const [searchValue, setSearchValue] = useState('')
  const isOpen = useSelectorWeb(state => getModalVisibility(state, MODAL_NAME))
  const trendingGenre = useSelectorWeb(getTrendingGenre) ?? Genre.ALL
  const dispatchWeb = useDispatchWeb()

  const genres = useMemo(() => {
    const searchValueLower = searchValue.toLowerCase()
    return GENRES.filter(genre =>
      genre.toLowerCase().includes(searchValueLower)
    )
  }, [searchValue])

  const handleClose = useCallback(() => {
    dispatchWeb(setVisibility({ modal: MODAL_NAME, visible: false }))
  }, [dispatchWeb])

  const handleSelect = useCallback(
    (genre: string) => {
      const trimmedGenre =
        genre === Genre.ALL
          ? null
          : (genre.replace(ELECTRONIC_PREFIX, '') as Genre)

      const handlePress = () => {
        dispatchWeb(setTrendingGenre(trimmedGenre))
        dispatchWeb(trendingWeekActions.reset())
        dispatchWeb(trendingMonthActions.reset())
        dispatchWeb(trendingAllTimeActions.reset())
        handleClose()
      }

      return handlePress
    },
    [dispatchWeb, handleClose]
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      isFullscreen
      title={messages.title}
      isGestureSupported={false}
    >
      <View style={styles.root}>
        <SearchInput
          placeholder={messages.searchPlaceholder}
          style={styles.search}
          value={searchValue}
          onChangeText={setSearchValue}
        />
        <FlatList
          data={genres}
          renderItem={({ item: genre }) => {
            const isSelected =
              ELECTRONIC_SUBGENRES[genre] === trendingGenre ||
              genre === trendingGenre

            return (
              <Button
                fullWidth
                variant={isSelected ? 'primary' : 'common'}
                title={genre}
                style={styles.genreButton}
                onPress={handleSelect(genre)}
              />
            )
          }}
        />
      </View>
    </Drawer>
  )
}
