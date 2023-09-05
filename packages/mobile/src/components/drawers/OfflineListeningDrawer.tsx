import type { ComponentType } from 'react'
import { useCallback, useState } from 'react'

import { View } from 'react-native'
import type { SvgProps } from 'react-native-svg'
import { useDispatch } from 'react-redux'

import IconCart from 'app/assets/images/iconCart.svg'
import IconDownload from 'app/assets/images/iconDownloadQueued.svg'
import IconFavorite from 'app/assets/images/iconFavorite.svg'
import IconRepost from 'app/assets/images/iconRepost.svg'
import { Button, Switch, Text } from 'app/components/core'
import { useDrawer } from 'app/hooks/useDrawer'
import { setVisibility } from 'app/store/drawers/slice'
import { requestDownloadAllFavorites } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { NativeDrawer } from '../drawer'

const useDrawerStyles = makeStyles(({ spacing, palette, typography }) => ({
  container: {
    paddingTop: spacing(4),
    paddingBottom: spacing(10),
    flexDirection: 'column',
    paddingHorizontal: spacing(4),
    rowGap: spacing(6),
    alignItems: 'center'
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing(2)
  },
  titleText: {
    textTransform: 'uppercase',
    marginTop: spacing(4)
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: typography.fontSize.large * 1.3
  },
  descriptionContainer: {
    width: '100%'
  },
  titleIcon: {
    position: 'relative',
    top: 7,
    color: palette.neutral,
    marginRight: spacing(3)
  }
}))

const useToggleStyles = makeStyles(({ spacing, palette }) => ({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center'
  },
  titleContainer: {
    columnGap: spacing(2),
    flexDirection: 'row'
  }
}))

const messages = {
  offlineListeningTitle: 'Offline Listening',
  offlineListeningDescription:
    'Use the toggles to select what you’d like synced for offline streaming.',
  comingSoonToggleSuffix: '(coming soon...)',
  favorites: 'Favorites',
  reposts: 'Reposts',
  purchased: 'Purchased',
  saveChanges: 'Save Changes'
}

const OfflineListeningOptionToggle = ({
  title,
  icon: Icon,
  value,
  onValueChange,
  disabled
}: {
  title: string
  icon: ComponentType<SvgProps>
  value: boolean
  onValueChange?: (value: boolean) => void | Promise<void>
  disabled?: boolean
}) => {
  const styles = useToggleStyles()
  const { neutral, neutralLight4 } = useThemeColors()

  return (
    <View style={styles.toggleContainer}>
      <View style={styles.titleContainer}>
        <Icon
          fill={disabled ? neutralLight4 : neutral}
          height={20}
          width={20}
        />
        <Text
          weight='demiBold'
          fontSize='large'
          color={disabled ? 'neutralLight4' : 'neutral'}
        >
          {title}
        </Text>
      </View>
      <Switch value={value} disabled={disabled} onValueChange={onValueChange} />
    </View>
  )
}

export const OfflineListeningDrawer = () => {
  const styles = useDrawerStyles()
  const { neutralLight2 } = useThemeColors()
  const dispatch = useDispatch()
  const { data, onClose } = useDrawer('OfflineListening')
  const { isFavoritesMarkedForDownload, onSaveChanges } = data

  const [isFavoritesOn, setIsFavoritesOn] = useState(
    isFavoritesMarkedForDownload
  )

  const handleSaveChanges = useCallback(() => {
    if (isFavoritesMarkedForDownload) {
      if (!isFavoritesOn) {
        dispatch(
          setVisibility({
            drawer: 'RemoveDownloadedFavorites',
            visible: true
          })
        )
        onSaveChanges(isFavoritesOn)
      }
    } else {
      // Favorites not already marked for download prior to opening drawer
      if (isFavoritesOn) {
        dispatch(requestDownloadAllFavorites())
        onSaveChanges(isFavoritesOn)
      }
    }
    onClose()
  }, [
    dispatch,
    isFavoritesMarkedForDownload,
    isFavoritesOn,
    onClose,
    onSaveChanges
  ])

  const handleToggleFavorites = useCallback((value: boolean) => {
    setIsFavoritesOn(value)
  }, [])

  return (
    <NativeDrawer drawerName='OfflineListening'>
      <View style={styles.container}>
        <View style={styles.title}>
          <IconDownload
            style={styles.titleIcon}
            fill={neutralLight2}
            height={20}
            width={24}
          />
          <View>
            <Text
              weight='heavy'
              color='neutralLight2'
              fontSize={'xl'}
              style={styles.titleText}
            >
              {messages.offlineListeningTitle}
            </Text>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text
            weight='medium'
            fontSize={'large'}
            style={styles.descriptionText}
          >
            {messages.offlineListeningDescription}
          </Text>
        </View>
        <OfflineListeningOptionToggle
          title={messages.favorites}
          icon={IconFavorite}
          value={isFavoritesOn}
          onValueChange={handleToggleFavorites}
        />
        <OfflineListeningOptionToggle
          title={`${messages.reposts} ${messages.comingSoonToggleSuffix}`}
          icon={IconRepost}
          value={false}
          disabled
        />
        <OfflineListeningOptionToggle
          title={`${messages.purchased} ${messages.comingSoonToggleSuffix}`}
          icon={IconCart}
          value={false}
          disabled
        />
        <Button
          title={messages.saveChanges}
          fullWidth
          size='large'
          variant='primary'
          onPress={handleSaveChanges}
        />
      </View>
    </NativeDrawer>
  )
}
