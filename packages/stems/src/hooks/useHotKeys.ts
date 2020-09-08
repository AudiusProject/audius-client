import { useEffect } from 'react'
import { Mapping, setupHotkeys, removeHotkeys } from 'utils/hotkeyUtil'

const useHotkeys = (mapping: Mapping) => {
  useEffect(() => {
    const hook = setupHotkeys(mapping)
    return () => {
      removeHotkeys(hook)
    }
  }, [mapping])
}

export default useHotkeys
