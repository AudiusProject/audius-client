import {
  savedPageActions,
  savedPageSelectors,
  LibraryCategory,
  LibraryCategoryType
} from '@audius/common'
import { HarmonySelectablePill } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import styles from './LibraryCategorySelectionMenu.module.css'

const { getSelectedCategory } = savedPageSelectors
const { setSelectedCategory } = savedPageActions

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
  const dispatch = useDispatch()
  const selectedCategory = useSelector(getSelectedCategory)
  const handleClick = (value: LibraryCategoryType) => {
    dispatch(setSelectedCategory(value))
  }

  return (
    <div role='radiogroup' className={styles.container}>
      {CATEGORIES.map((c) => (
        <HarmonySelectablePill
          role='radio'
          size='large'
          aria-checked={selectedCategory === c.value ? 'true' : 'false'}
          key={c.value}
          isSelected={selectedCategory === c.value}
          onClick={() => handleClick(c.value)}
          label={c.label}
        />
      ))}
    </div>
  )
}
