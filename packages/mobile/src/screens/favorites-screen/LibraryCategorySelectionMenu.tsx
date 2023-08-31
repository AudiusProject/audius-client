import type { LibraryCategoryType } from '@audius/common'
import {
  savedPageActions,
  savedPageSelectors,
  LibraryCategory
} from '@audius/common'
import { ScrollView, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { HarmonySelectablePill } from 'app/components/core/HarmonySelectablePill'
import { makeStyles } from 'app/styles'

const { getSelectedCategory } = savedPageSelectors
const { setSelectedCategory } = savedPageActions

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    flexGrow: 1,
    flexDirection: 'row',
    marginTop: spacing(3)
  },
  scrollContainer: {
    columnGap: spacing(2)
  }
}))

const CATEGORIES = [
  {
    label: 'All',
    value: LibraryCategory.All
  },
  {
    label: 'Favorites',
    value: LibraryCategory.Favorite
  },
  {
    label: 'Reposts',
    value: LibraryCategory.Repost
  },
  {
    label: 'Purchased',
    value: LibraryCategory.Purchase
  }
]

export const LibraryCategorySelectionMenu = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const selectedCategory = useSelector(getSelectedCategory)
  const handleClick = (value: LibraryCategoryType) => {
    dispatch(setSelectedCategory(value))
  }
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        role='radiogroup'
        accessibilityRole='radiogroup'
        contentContainerStyle={styles.scrollContainer}
        alwaysBounceHorizontal={false}
      >
        {CATEGORIES.map((c) => (
          <HarmonySelectablePill
            key={c.value}
            accessibilityRole='radio'
            aria-checked={selectedCategory === c.value}
            onPress={() => handleClick(c.value)}
            role='radio'
            label={c.label}
            isSelected={selectedCategory === c.value}
          />
        ))}
      </ScrollView>
    </View>
  )
}
