import { fetchAllFollowArtists } from 'common/store/pages/signon/actions'
import { FlatList, ScrollView, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { useEffectOnce } from 'react-use'

import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

import { ContinueButton } from './ContinueButton'
import { PickArtistsForMeButton } from './PickArtistsForMeButton'
import { SelectArtistCategoryButtons } from './SelectArtistCategoryButtons'
import { SuggestedArtistsList } from './SuggestedArtistsList'

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    flex: 1,
    justifyContent: 'space-between'
  },
  header: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(6),
    borderBottomWidth: 1,
    borderColor: palette.neutralLight6,
    backgroundColor: palette.white
  },
  title: {
    textAlign: 'center'
  },
  instruction: {
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing(4),
    paddingHorizontal: spacing(4)
  }
}))

const messages = {
  title: 'Follow At Least 3 Artists To Get Started',
  instruction:
    'Tracks uploaded or reposted by people you follow will appear in your feed.'
}

type SuggestedFollowsProps = {
  onPress: () => void
  title: string
  screen: 'sign-on' | 'feed'
}

export const SuggestedFollows = (props: SuggestedFollowsProps) => {
  const { onPress, title, screen } = props
  const styles = useStyles()
  const dispatch = useDispatch()

  useEffectOnce(() => {
    dispatch(fetchAllFollowArtists())
  })

  const headerElement = (
    <>
      <View style={styles.header}>
        {title ? (
          <Text variant='h1' color='secondary' style={styles.title}>
            {title}
          </Text>
        ) : null}
        <Text variant='body1' style={styles.instruction}>
          {messages.instruction}
        </Text>
        <SelectArtistCategoryButtons />
      </View>
      <PickArtistsForMeButton />
    </>
  )

  // const InnerComponent = screen === 'sign-on' ? View : ScrollView

  return (
    <View style={styles.root}>
      {screen === 'feed' ? headerElement : null}
      <SuggestedArtistsList
        FlatListComponent={FlatList}
        ListHeaderComponent={screen === 'sign-on' ? headerElement : null}
      />
      <ContinueButton onPress={onPress} />
    </View>
  )
}
