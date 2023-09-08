import {
  CommonState,
  LibraryCategory,
  LibraryCategoryType,
  savedPageActions,
  savedPageSelectors,
  SavedPageTabs
} from '@audius/common'
import { HarmonySelectablePill } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { useIsUSDCEnabled } from 'hooks/useIsUSDCEnabled'

import styles from './LibraryCategorySelectionMenu.module.css'

const { getCategory } = savedPageSelectors
const { setSelectedCategory } = savedPageActions

const ALL_CATEGORIES = [
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

const CATEGORIES_WITHOUT_PURCHASED = ALL_CATEGORIES.slice(0, -1)

type LibraryCategorySelectionMenuProps = { currentTab: SavedPageTabs }

export const LibraryCategorySelectionMenu = ({
  currentTab
}: LibraryCategorySelectionMenuProps) => {
  const dispatch = useDispatch()
  const selectedCategory = useSelector((state: CommonState) =>
    getCategory(state, { currentTab })
  )
  const handleClick = (value: LibraryCategoryType) => {
    dispatch(setSelectedCategory({ currentTab, category: value }))
  }

  const isUSDCPurchasesEnabled = useIsUSDCEnabled()
  const categories =
    currentTab === SavedPageTabs.TRACKS && isUSDCPurchasesEnabled
      ? ALL_CATEGORIES
      : CATEGORIES_WITHOUT_PURCHASED

  return (
    <div role='radiogroup' className={styles.container}>
      {categories.map((c) => (
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
