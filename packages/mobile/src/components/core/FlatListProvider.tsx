import { forwardRef } from 'react'

import { Animated, FlatList, FlatListProps } from 'react-native'
import { useCollapsibleScene } from 'react-native-collapsible-tab-view'

type FlatListProviderProps = {
  isCollapsible?: boolean
  collapsibleSceneName?: string
} & FlatListProps<any>

type CollapsibleFlatListProps = {
  collapsibleSceneName: string
} & FlatListProps<any>

const CollapsibleFlatList = ({
  collapsibleSceneName,
  ...other
}: CollapsibleFlatListProps) => {
  const scrollPropsAndRef = useCollapsibleScene(collapsibleSceneName)
  return <Animated.FlatList {...scrollPropsAndRef} {...other} />
}

/**
 * Provides either a FlatList or an animated FlatList
 * depending on whether or not the list is found in a "collapsible" header tab
 */
export const FlatListProvider = forwardRef<FlatList, FlatListProviderProps>(
  (props: FlatListProviderProps, ref) => {
    const { isCollapsible, collapsibleSceneName, ...other } = props
    if (isCollapsible && collapsibleSceneName) {
      return (
        <CollapsibleFlatList
          collapsibleSceneName={collapsibleSceneName}
          {...other}
        />
      )
    }
    return <FlatList ref={ref} {...other} />
  }
)
