import { ReactElement, ReactNode, useEffect } from 'react'

import { useNavigation } from '@react-navigation/native'

type ScreenProps = {
  children: ReactNode
  topbarLeft?: ReactElement
  topbarRight?: ReactElement
  title?: string
}
export const Screen = (props: ScreenProps) => {
  const { children, topbarLeft, topbarRight, title } = props
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({
      headerLeft: topbarLeft ? () => topbarLeft : undefined,
      headerRight: topbarRight ? () => topbarRight : undefined,
      title
    })
  }, [navigation, topbarLeft, topbarRight, title])

  return <>{children}</>
}
