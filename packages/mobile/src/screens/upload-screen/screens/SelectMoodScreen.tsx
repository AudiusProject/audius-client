import { View, Image } from 'react-native'

import IconMood from 'app/assets/images/iconMood.svg'
import { Text } from 'app/components/core'
import { ListSelectionScreen } from 'app/screens/list-selection-screen'
import { makeStyles } from 'app/styles'
import { moodMap } from 'app/utils/moods'

const messages = {
  screenTitle: 'Select Mood',
  searchText: 'Search Moods'
}

const moods = Object.keys(moodMap).map((mood) => ({
  value: mood,
  label: mood
}))

moods.sort((mood1, mood2) => mood1.label.localeCompare(mood2.label))

const useStyles = makeStyles(({ spacing }) => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  emoji: {
    height: spacing(4),
    width: spacing(4),
    marginRight: spacing(2)
  }
}))

export const SelectMoodScreen = () => {
  const styles = useStyles()

  return (
    <ListSelectionScreen
      data={moods}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Image source={moodMap[item.label]} style={styles.emoji} />
          <Text fontSize='large' weight='bold' color='neutralLight4'>
            {item.label}
          </Text>
        </View>
      )}
      screenTitle={messages.screenTitle}
      icon={IconMood}
      searchText={messages.searchText}
    />
  )
}
