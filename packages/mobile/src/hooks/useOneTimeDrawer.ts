import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Drawer as DrawerName } from 'app/store/drawers/slice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAsync } from 'react-use'
import { setVisibility } from 'app/store/drawers/slice'

type UseOneTimeDrawerProps = {
  key: string // AsyncStorage key
  name: DrawerName
  disabled?: boolean
}

export const useOneTimeDrawer = ({ key, name, disabled = false }: UseOneTimeDrawerProps) => {
  if (disabled) return

  const dispatch = useDispatch()
  const { value: seen, loading } = useAsync(() =>
    AsyncStorage.getItem(key)
  )

  useEffect(() => {
    const shouldOpen = !loading && !seen
    if (shouldOpen) {
      dispatch(
        setVisibility({ drawer: name, visible: true })
      )
      AsyncStorage.setItem(key, 'true')
    }
  }, [loading, seen, dispatch])
}
