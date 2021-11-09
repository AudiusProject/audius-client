/* eslint-disable import/order, import/no-duplicates */

declare module 'fxa-common-password-list'
declare module 'react-native-static-server'

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<
    SvgProps & {
      fillSecondary?: string
    }
  >
  export default content
}

declare module '*.png' {
  import { ImageSourcePropType } from 'react-native'
  const value: ImageSourcePropType
  export default value
}

declare module '*.jpg' {
  import { ImageSourcePropType } from 'react-native'
  const value: ImageSourcePropType
  export default value
}

declare module '@react-native-masked-view/masked-view' {
  import * as React from 'react'
  import * as ReactNative from 'react-native'

  interface MaskedViewProps extends ReactNative.ViewProps {
    maskElement: React.ReactElement
    androidRenderingMode?: 'software' | 'hardware'
  }
  export default class MaskedViewComponent extends React.Component<
    MaskedViewProps
  > {}
}

// Remove everything below when audius-mobile-client is no longer dependent on audius-client
// These are needed because we currently have to include audius-client in the typechecking
declare module '*.module.css' {
  const value: any
  export default value
}

declare module '*.json' {
  const value: any
  export default value
}

interface Window {
  MSStream: any
}
