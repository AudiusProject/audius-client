import type { SearchResults } from 'audius-client/src/common/store/search-bar/types'
import { View } from 'react-native'

import { Divider, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

export type SectionHeader = keyof SearchResults

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(4)
  },
  header: {
    textTransform: 'uppercase',
    marginRight: 8
  }
}))

type SearchSectionHeaderProps = { title: string }

export const SearchSectionHeader = (props: SearchSectionHeaderProps) => {
  const { title } = props
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <Text variant='h2' color='secondary' noGutter style={styles.header}>
        {title}
      </Text>
      <Divider />
    </View>
  )
}
