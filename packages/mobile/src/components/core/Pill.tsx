import type { ReactNode } from 'react'

import { View } from 'react-native'

import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ spacing, palette }) => ({
  optionPill: {
    padding: spacing(2),
    backgroundColor: palette.neutralLight8,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    opacity: 0.8,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center'
  }
}))

type PillProps = {
  children: ReactNode
}

export const Pill = (props: PillProps) => {
  const { children } = props
  const styles = useStyles()

  return <View style={styles.optionPill}>{children}</View>
}
