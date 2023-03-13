import type { ReactNode } from 'react'

import { TouchableOpacity } from 'react-native-gesture-handler'

import IconArrow from 'app/assets/images/iconArrow.svg'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemePalette } from 'app/utils/theme'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(2)
  }
}))

type SearchResultProps = {
  onPress: () => void
  children: ReactNode
}

export const SearchResult = (props: SearchResultProps) => {
  const { onPress, children } = props
  const { neutralLight4 } = useThemePalette()
  const styles = useStyles()

  return (
    <TouchableOpacity style={styles.root} onPress={onPress}>
      {children}
      <IconArrow fill={neutralLight4} height={spacing(4)} width={spacing(4)} />
    </TouchableOpacity>
  )
}
