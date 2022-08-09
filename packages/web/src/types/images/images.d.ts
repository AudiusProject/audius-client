declare module '*.svg' {
  import React from 'react'
  export const ReactComponent: React.VFC<React.SVGProps<SVGSVGElement>>
}

declare module '*.png' {
  const value: any
  export = value
}

declare module '*.jpg' {
  const value: any
  export = value
}

declare module '*.gif' {
  const src: string
  export default src
}
