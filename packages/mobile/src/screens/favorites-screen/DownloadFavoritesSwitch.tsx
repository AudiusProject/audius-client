import { useLayoutEffect, useState } from 'react'

import { reachabilitySelectors } from '@audius/common'
import type { SwitchProps } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { Switch } from 'app/components/core'
import { useThrottledCallback } from 'app/hooks/useThrottledCallback'
import { DOWNLOAD_REASON_FAVORITES } from 'app/services/offline-downloader'
import { setVisibility } from 'app/store/drawers/slice'
import { getCollectionDownloadStatus } from 'app/store/offline-downloads/selectors'
import { requestDownloadAllFavorites } from 'app/store/offline-downloads/slice'

const { getIsReachable } = reachabilitySelectors

type DownloadFavoritesSwitchProps = SwitchProps

export const DownloadFavoritesSwitch = (
  props: DownloadFavoritesSwitchProps
) => {
  const { onValueChange, ...other } = props
  const dispatch = useDispatch()

  const isSwitchDisabled = useSelector((state) => {
    const isReachable = getIsReachable(state)
    return !isReachable
  })

  const isMarkedForDownload = useSelector((state) =>
    Boolean(getCollectionDownloadStatus(state, DOWNLOAD_REASON_FAVORITES))
  )

  const [value, setValue] = useState(isMarkedForDownload)

  const handleValueChange = useThrottledCallback(
    (newValue: boolean) => {
      if (newValue) {
        dispatch(requestDownloadAllFavorites())
        setValue(true)
        onValueChange?.(true)
      } else {
        dispatch(
          setVisibility({
            drawer: 'RemoveDownloadedFavorites',
            visible: true
          })
        )
      }
    },
    800,
    [dispatch, onValueChange]
  )

  // When user confirms removal, turn switch off
  useLayoutEffect(() => {
    if (!isMarkedForDownload) {
      setValue(false)
      onValueChange?.(false)
    }
  }, [isMarkedForDownload, onValueChange])

  return (
    <Switch
      value={value}
      onValueChange={handleValueChange}
      disabled={isSwitchDisabled}
      {...other}
    />
  )
}
