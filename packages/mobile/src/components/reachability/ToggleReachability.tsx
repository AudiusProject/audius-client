import { useCallback } from 'react'

import { reachabilityActions, reachabilitySelectors } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import IconNoWifi from 'app/assets/images/iconNoWifi.svg'
import { Switch } from 'app/components/core'
const { getIsReachable } = reachabilitySelectors
export const ToggleReachability = () => {
  const dispatch = useDispatch()
  const reachability = useSelector(getIsReachable)

  useEffectOnce(() => {
    // dispatch(reachabilityActions.setUnreachable())
  })

  const handleValueChange = useCallback(
    (value: boolean) => {
      dispatch(
        value
          ? reachabilityActions.setReachable()
          : reachabilityActions.setUnreachable()
      )
    },
    [dispatch]
  )

  return (
    <>
      {reachability ? null : <IconNoWifi height={20} width={20} />}
      <Switch
        onValueChange={handleValueChange}
        value={reachability ?? undefined}
      />
    </>
  )
}
