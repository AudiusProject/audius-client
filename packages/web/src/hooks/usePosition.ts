import { useState, useCallback } from 'react'

import { Nullable } from 'common/utils/typeUtils'

/**
 * Gets the position of the element represented by the callback ref.
 */
export const usePosition = () => {
  const [position, setPosition] = useState<Nullable<DOMRect>>(null)

  const ref = useCallback((node: HTMLDivElement) => {
    setPosition(node.getBoundingClientRect())
  }, [])

  return { position, ref }
}
