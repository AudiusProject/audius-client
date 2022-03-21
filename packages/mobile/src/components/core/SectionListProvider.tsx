import { forwardRef } from 'react'

import { Animated, SectionList, SectionListProps } from 'react-native'
import { useCollapsibleScene } from 'react-native-collapsible-tab-view'

type SectionListProviderProps = {
  isCollapsible?: boolean
  collapsibleSceneName?: string
} & SectionListProps<any>

type CollapsibleSectionListProps = {
  collapsibleSceneName: string
} & SectionListProps<any>

/**
 * Create a custom hook for the collapsible scene.
 * This is necessary because SectionLists by default do not have a
 * "scrollTo" built in, which breaks the collapsible tab library.
 * Inside this custom hook, we create a realRef method that pulls the
 * scroll responder out from inside the SectionList.
 */
const useCollapsibleSectionListScene = (sceneName: string) => {
  const scrollPropsAndRef = useCollapsibleScene(sceneName)
  const scrollableRef = (ref: SectionList) => {
    scrollPropsAndRef.ref(ref?.getScrollResponder())
  }
  return {
    ...scrollPropsAndRef,
    ref: scrollableRef
  }
}

const CollapsibleSectionList = ({
  collapsibleSceneName,
  ...other
}: CollapsibleSectionListProps) => {
  const scrollPropsAndRef = useCollapsibleSectionListScene(collapsibleSceneName)
  return <Animated.SectionList {...other} {...scrollPropsAndRef} />
}

/**
 * Provides either a SectionList or an animated SectionList
 * depending on whether or not the list is found in a "collapsible" header tab
 */
export const SectionListProvider = forwardRef<
  SectionList,
  SectionListProviderProps
>((props: SectionListProviderProps, ref) => {
  const { isCollapsible, collapsibleSceneName, ...other } = props
  if (isCollapsible && collapsibleSceneName) {
    return (
      <CollapsibleSectionList
        collapsibleSceneName={collapsibleSceneName}
        {...other}
      />
    )
  }
  return <SectionList ref={ref} {...other} />
})
