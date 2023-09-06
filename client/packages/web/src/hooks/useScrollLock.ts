import { useScrollLock as stemsScrollLock } from '@audius/stems'
import { useDispatch } from 'react-redux'

import {
  incrementScrollCount,
  decrementScrollCount
} from 'store/application/ui/scrollLock/actions'

/**
 * Wraps Stems `useScrollLock` passing in increment and decrement store functions.
 */
const useScrollLock = (
  lock: boolean,
  increment?: () => void,
  decrement?: () => void
) => {
  const dispatch = useDispatch()
  increment = increment ?? (() => dispatch(incrementScrollCount()))
  decrement = decrement ?? (() => dispatch(decrementScrollCount()))
  stemsScrollLock(lock, increment, decrement)
}

export default useScrollLock
