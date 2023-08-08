import { useCallback, useRef } from 'react'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

import { CommonState } from 'store/index'

export type BaseModalState = {
  isOpen: boolean
}

/**
 * Creates the necessary actions/reducers/selectors for a modal,
 * and returns the reducer to be wired to the store
 * and hook to be used in the application.
 */
export const createModal = <T>({
  reducerPath,
  initialState,
  sliceSelector
}: {
  reducerPath: string
  initialState: T & BaseModalState
  sliceSelector?: (state: CommonState) => Record<string, any>
}) => {
  const slice = createSlice({
    name: `modals/${reducerPath}`,
    initialState,
    reducers: {
      setState: (_, action: PayloadAction<T & BaseModalState>) => {
        return action.payload
      }
    }
  })

  const selector = (state: CommonState) => {
    let baseState: (T & BaseModalState) | undefined
    if (sliceSelector) {
      baseState = sliceSelector(state)[reducerPath]
    } else {
      baseState = state[reducerPath]
    }
    if (!baseState) {
      throw new Error(
        `State for ${reducerPath} is undefined - did you forget to register the reducer in @audius/common/src/modals/reducers.ts?`
      )
    }
    return baseState
  }

  // Need to explicitly retype this because TS got confused
  const setState = slice.actions.setState as (
    state: T & BaseModalState
  ) => PayloadAction<T & BaseModalState>

  /**
   * A hook that returns the state of the modal,
   * a setter callback that opens the modal,
   * and a close callback that clears the state and closes it.
   * @returns [state, open, close] state of the modal, callback to open the modal, callback to close the modal
   */
  const useModal = () => {
    // Use a ref to prevent flickers on close when state is cleared.
    // Only reflect state changes on modal open.
    const lastOpenedState = useRef<T & BaseModalState>(initialState)
    const currentState = useSelector(selector)
    if (currentState.isOpen) {
      lastOpenedState.current = currentState
    } else {
      // Keep existing state, except now set visible to false
      lastOpenedState.current = {
        ...lastOpenedState.current,
        isOpen: false
      }
    }
    const dispatch = useDispatch()
    const open = useCallback(
      (state?: T) => {
        if (!state) {
          dispatch(setState({ ...initialState, isOpen: true }))
        } else {
          dispatch(setState({ ...state, isOpen: true }))
        }
      },
      [dispatch]
    )
    const close = useCallback(() => {
      dispatch(setState({ ...initialState, isOpen: false }))
    }, [dispatch])
    return [lastOpenedState.current, open, close] as const
  }

  return {
    hook: useModal,
    reducer: slice.reducer
  } as const
}
