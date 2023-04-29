import { useCallback, useState } from 'react'

import {
  Kind,
  SquareSizes,
  getTierForUser,
  imageProfilePicEmpty
} from '@audius/common'
import { SelectProps } from 'antd'
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
      disabled: !user.allow_ai_attribution,
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
          allowAiAttribution={user.allow_ai_attribution}
          name={user.name}
          handle={user.handle}
        />
      )
    }))
    .filter((item) => item.text)
  return { items }
})

type AiAttributionDropdownProps = SelectProps

export const AiAttributionDropdown = (props: AiAttributionDropdownProps) => {
  const dispatch = useDispatch()
  const users = useSelector(selectSearchResults)
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = useCallback(
    (searchInput: string) => {
      dispatch(fetchSearch(searchInput))
      setSearchInput(searchInput)
    },
    [dispatch]
  )

  return (
    <DropdownInput
      menu={users}
      label='Find Users'
      size='large'
      input={searchInput}
      onSearch={handleSearch}
      {...props}
    />
  )
}
