import { useEffect, useRef } from 'react'

import { attestFromSolana } from '@certusone/wormhole-sdk'

export const Root = () => {
  const solonaRef = useRef(attestFromSolana)

  useEffect(() => {
    console.log(solonaRef.current)
  }, [])

  return <p>hello worldd</p>
}
