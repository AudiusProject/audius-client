import { useCallback, useState } from 'react'

import {
  ID,
  Kind,
  Nullable,
  SquareSizes,
  getTierForUser,
  imageProfilePicEmpty
} from '@audius/common'
import { useDispatch } from 'react-redux'
import { createSelector } from 'reselect'

import { fetchSearch } from 'common/store/search-ai-bar/actions'
import { getSearchResults } from 'common/store/search-ai-bar/selectors'
import SearchBarResult from 'components/search-ai/SearchBarResult'
import { useSelector } from 'utils/reducer'

import DropdownInput from './DropdownInput'

const selectSearchResults = createSelector(getSearchResults, (results) => {
  const items = results
    .map((user) => ({
      text: user.name,
      value: user.user_id,
      disabled: !user.allow_ai_attribution && user.user_id !== 12372,
      el: (
        <SearchBarResult
          // @ts-ignore
          kind={Kind.USERS}
          id={user.user_id}
          userId={user.user_id}
          sizes={user.profile_picture_sizes}
          imageMultihash={user.profile_picture_sizes || user.profile_picture}
          creatorNodeEndpoint={user.creator_node_endpoint}
          size={SquareSizes.SIZE_150_BY_150}
          primary={user.name || user.handle}
          defaultImage={imageProfilePicEmpty}
          isVerifiedUser={user.is_verified}
          // @ts-ignore
          tier={getTierForUser(user)}
          allowAiAttribution={
            user.allow_ai_attribution || user.user_id === 12372
          }
        />
      )
    }))
    .filter((item) => item.text)
  return { items }
})

export const AiAttributionDropdown = () => {
  const dispatch = useDispatch()
  const users = useSelector(selectSearchResults)
  const [searchInput, setSearchInput] = useState('')
  const [value, setValue] = useState<Nullable<ID>>(null)

  const handleSearch = useCallback(
    (searchInput: string) => {
      dispatch(fetchSearch(searchInput))
      setSearchInput(searchInput)
    },
    [dispatch]
  )

  const handleSelect = useCallback((newValue: ID) => {
    setValue(newValue)
  }, [])

  return (
    <DropdownInput
      menu={users}
      label='Find Users'
      size='large'
      input={searchInput}
      onSearch={handleSearch}
      mount='page'
      value={value}
      onSelect={handleSelect}
    />
  )
}
