import { ComponentType, Suspense } from 'react'

import { Modals } from '@audius/common'

import { useModalState } from './useModalState'

type AppModalProps = {
  modal: ComponentType
  name: Modals
}

/*
 * Conditionally renders the modals hooked up to common/ui/modal slice
 */
export const AppModal = (props: AppModalProps) => {
  const { name, modal: Modal } = props
  const { modalState } = useModalState(name)

  if (modalState === false) return null

  return (
    // <Suspense fallback={null}>
    <Modal />
    // </Suspense>
  )
}
