import { ParamListBase } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { makeGetExplore } from 'audius-client/src/common/store/pages/explore/selectors'
import { View } from 'react-native'

import { ArtistCard } from 'app/components/artist-card'
import { CardList } from 'app/components/core'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { TabInfo } from '../components/TabInfo'

const messages = {
  infoHeader: 'Featured Artists'
}

type Props = {
  navigation: NativeStackNavigationProp<ParamListBase, keyof ParamListBase>
}

const useStyles = makeStyles(({ spacing }) => ({
  contentContainer: {
    paddingBottom: spacing(8)
  },
  header: {
    marginBottom: spacing(2)
  }
}))

const getExplore = makeGetExplore()

export const ArtistsTab = ({ navigation }: Props) => {
  const styles = useStyles()
  const { profiles } = useSelectorWeb(getExplore)

  return (
    <CardList
      ListHeaderComponent={
        <View style={styles.header}>
          <TabInfo header={messages.infoHeader} />
        </View>
      }
      contentContainerStyle={styles.contentContainer}
      data={profiles}
      renderItem={({ item }) => <ArtistCard artist={item} />}
    />
  )
}
