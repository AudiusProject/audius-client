import type { ComponentType } from 'react'

import { View } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import { Text } from 'app/components/core'
import { ProgressBar } from 'app/components/progress-bar'
import { makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

type DownloadProgressRowProps = {
  title: string
  icon: ComponentType<SvgProps>
  numDownloadsSuccess: number
  numDownloads: number
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: spacing(2)
  },
  text: {
    marginBottom: 2
  },
  progressBar: {
    width: 98,
    height: spacing(1),
    borderRadius: 8,
    marginVertical: 0,
    backgroundColor: palette.neutralLight4
  }
}))

export const DownloadProgressRow = (props: DownloadProgressRowProps) => {
  const { title, icon: Icon, numDownloadsSuccess, numDownloads } = props
  const styles = useStyles()
  const neutralLight4 = useColor('neutralLight4')

  return (
    <View style={styles.root}>
      <Icon fill={neutralLight4} />
      <Text style={styles.text} color='neutral' weight='demiBold' fontSize='xs'>
        {title} {`${numDownloadsSuccess}/${numDownloads}`}
      </Text>
      <ProgressBar
        style={{
          root: styles.progressBar
        }}
        progress={numDownloadsSuccess}
        max={numDownloads}
      />
    </View>
  )
}
