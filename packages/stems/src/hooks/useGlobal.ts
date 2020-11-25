import { useEffect } from 'react'

declare global {
  interface Window {
    AudiusStems: any
  }
}

window.AudiusStems = window.AudiusStems || {}

/**
 * Hook to "share state" between components using the global window object.
 * Obviously, comes with caveats with globals.
 *
 * @param name shared name between users of a useGlobal
 * @param initialValue
 * @returns getter, setter
 *  Similar to useState, except the getter is a function and the
 *  setter should only be invoked with a mutator function rather than a "new value"
 */
const useGlobal = <T>(
  name: string,
  initialValue: T
): [() => T, (mutator: (cur: T) => void) => void] => {
  useEffect(() => {
    window.AudiusStems[name] = initialValue
  }, [name, initialValue])

  const getter = () => window.AudiusStems[name]
  const setter = (mutator: (cur: T) => void) => {
    window.AudiusStems[name] = mutator(window.AudiusStems[name])
  }

  return [getter, setter]
}

export default useGlobal
