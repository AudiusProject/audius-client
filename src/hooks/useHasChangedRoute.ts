import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook that fires a callback when the route changes
 * Normally, you can use `useEffect` on the pathname from useLocation, but this
 * hook ignores the first call of useEffect
 *
 * @param {function} onRouteChange the callback fired when the route changes
 */
const useHasChangedRoute = (onRouteChange: () => void) => {
  const { pathname } = useLocation()
  const [currentRoute, setCurrentRoute] = useState(pathname)
  useEffect(() => {
    if (pathname !== currentRoute) {
      setCurrentRoute(pathname)
      onRouteChange()
    }
  }, [pathname, currentRoute, setCurrentRoute, onRouteChange])
}

export default useHasChangedRoute
