import { StyleSheet, Text, View } from 'react-native'

import IconSearch from 'app/assets/images/iconSearch.svg'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors, useThemeColors } from 'app/utils/theme'

const messages = {
  header: 'More Results',
  title1: "Sorry, we couldn't find anything matching",
  title2: 'Please check your spelling or try broadening your search.'
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    iconContainer: {
      marginTop: 100,
      marginBottom: 24,
      transform: [{ scaleX: -1 }]
    },
    textContainer: {
      maxWidth: 240,
      textAlign: 'center',
      padding: 8,
      color: themeColors.neutralDark2
    },
    queryText: {
      color: themeColors.neutralLight2
    }
  })

type EmptyResultsProps = { query: string }

export const EmptyResults = ({ query }: EmptyResultsProps) => {
  const styles = useThemedStyles(createStyles)
  const { neutral } = useThemeColors()
  return (
    <View
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <View style={styles.iconContainer}>
        <IconSearch fill={neutral} height='30' width='30' />
      </View>
      <Text style={styles.textContainer}>{messages.title1}</Text>
      <Text style={styles.queryText}>{`"${query}"`}</Text>
      <Text style={styles.textContainer}>{messages.title2}</Text>
    </View>
  )
}
