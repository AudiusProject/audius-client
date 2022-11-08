import { GENRES } from '@audius/common'

import IconGenre from 'app/assets/images/iconGenre.svg'
import { Text } from 'app/components/core'

import { ContextualSubmenuField } from './ContextualSubmenuField'

const messages = {
  genre: 'Genre',
  error: 'Selection Required',
  screenTitle: 'Select Genre',
  searchText: 'Select Genres'
}

const genres = GENRES.map((genre) => ({ value: genre, label: genre }))

export const SelectGenreField = () => {
  return (
    <ContextualSubmenuField
      name='genre'
      label={messages.genre}
      data={genres}
      required
      errorMessage={messages.error}
      ListSelectionProps={{
        renderItem: ({ item }) => (
          <Text fontSize='large' weight='bold' color='neutralLight4'>
            {item.label}
          </Text>
        ),
        screenTitle: messages.screenTitle,
        icon: IconGenre,
        searchText: messages.searchText
      }}
    />
  )
}
