import { useLocation } from 'react-router-dom'

export const DevModeMananger = () => {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const devModeParam = params.get('dev-mode')

  if (devModeParam && ['true', 'false'].includes(devModeParam)) {
    if (devModeParam === 'true') {
      window.localStorage.setItem('enable-dev-mode', devModeParam)
    } else {
      window.localStorage.removeItem('enable-dev-mode')
    }
  }

  return null
}
