import type { ComponentType, ReactNode } from 'react'
import { useContext, useCallback } from 'react'

import { TouchableOpacity, View } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import type { TextProps } from 'app/components/core'
import { Text } from 'app/components/core'
import type { ContextualParams } from 'app/hooks/useNavigation'
import type { AppTabScreenParamList } from 'app/screens/app-screen'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

import { AppDrawerContext } from '../AppDrawerContext'
import { useAppDrawerNavigation } from '../useAppDrawerNavigation'

const useStyles = makeStyles(({ spacing }) => ({
  accountListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing(6),
    paddingVertical: spacing(4)
  },
  accountListItemIconRoot: {
    width: spacing(10)
  },
  accountListItemIcon: {
    marginRight: spacing(2),
    paddingVertical: spacing(1)
  },
  label: {
    marginTop: spacing(1)
  }
}))

type LeftNavLinkProps<Screen extends keyof AppTabScreenParamList> = {
  icon: ComponentType<SvgProps>
  iconProps?: SvgProps
  to: Screen
  params: AppTabScreenParamList[Screen] extends undefined
    ? ContextualParams | null
    : AppTabScreenParamList[Screen] & ContextualParams
  label: string
  labelProps?: TextProps
  children?: ReactNode
}

export const LeftNavLink = <Screen extends keyof AppTabScreenParamList>(
  props: LeftNavLinkProps<Screen>
) => {
  const {
    icon: Icon,
    iconProps,
    to,
    params,
    label,
    labelProps,
    children
  } = props
  const styles = useStyles()
  const { neutral } = useThemeColors()
  const navigation = useAppDrawerNavigation()
  const { drawerHelpers } = useContext(AppDrawerContext)

  const handlePress = useCallback(() => {
    // @ts-expect-error navigation not smart enough here
    navigation.navigate(to, { fromAppDrawer: true, ...params })
    drawerHelpers.closeDrawer()
  }, [navigation, to, params, drawerHelpers])

  return (
    <TouchableOpacity style={styles.accountListItem} onPress={handlePress}>
      <View style={styles.accountListItemIconRoot}>
        <Icon
          fill={neutral}
          height={spacing(7)}
          width={spacing(7)}
          {...iconProps}
          style={[styles.accountListItemIcon, iconProps?.style]}
        />
      </View>
      <Text
        fontSize='large'
        weight='demiBold'
        {...labelProps}
        style={[styles.label, labelProps?.style]}
      >
        {label}
      </Text>
      {children}
    </TouchableOpacity>
  )
}
