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

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: spacing(2)
  },
  topRow: {
    height: 20,
    flexDirection: 'row',
    // justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: spacing(2)
  },
  text: {
    ...typography.body,
    fontFamily: typography.fontByWeight.demiBold
  },
  progressBar: {
    width: '100%',
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
  // const inProgress = numDownloadsSuccess < numDownloads
  const inProgress = true

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Icon fill={neutralLight4} height={20} width={20} />
        <Text
          style={styles.text}
          color='neutral'
          weight='demiBold'
          fontSize='xs'
        >
          {`${numDownloadsSuccess} / ${numDownloads}`} {title}
        </Text>
      </View>

      {inProgress ? (
        <ProgressBar
          style={{
            root: styles.progressBar
          }}
          progress={numDownloadsSuccess}
          max={numDownloads}
        />
      ) : null}
    </View>
  )
}
