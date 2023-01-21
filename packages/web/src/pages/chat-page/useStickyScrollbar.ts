import { MutableRefObject, useLayoutEffect, useRef } from 'react'

type StickyScrollbarOptions = {
  ref: MutableRefObject<HTMLElement | null>
  initDep: any
  list: any[]
}
type MeasuresBefore = {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}

export const useStickyScrollbar = ({
  ref,
  initDep,
  list
}: StickyScrollbarOptions) => {
  const oldInitDep = useRef<any>()
  const oldUpdateDep = useRef<any[]>([])
  const measuresBefore = useRef<MeasuresBefore>({
    scrollHeight: 0,
    scrollTop: 0,
    clientHeight: 0
  })

  const didUpdate = list !== oldUpdateDep.current
  if (didUpdate) {
    if (ref.current) {
      // Before render, save the height and scroll position
      measuresBefore.current = {
        scrollHeight: ref.current.scrollHeight,
        scrollTop: ref.current.scrollTop,
        clientHeight: ref.current.clientHeight
      }
    }
  }

  useLayoutEffect(() => {
    if (ref.current) {
      if (initDep !== oldInitDep.current) {
        oldInitDep.current = initDep

        // If re-initting something that's already loaded
        // this will make us start from the bottom again after render
        ref.current.scrollTo({ top: ref.current.scrollHeight })
      } else if (didUpdate) {
        oldUpdateDep.current = list
        const wasAtBottomBeforeRender =
          measuresBefore.current.clientHeight +
            measuresBefore.current.scrollTop >=
          measuresBefore.current.scrollHeight
        const wasAtTopBeforeRender = measuresBefore.current.scrollTop === 0
        if (wasAtBottomBeforeRender) {
          // Stick to the bottom
          ref.current.scrollTo({ top: ref.current.scrollHeight })
        } else if (wasAtTopBeforeRender) {
          // Don't get stuck to the top
          ref.current.scrollTo({
            top:
              ref.current.scrollHeight -
              measuresBefore.current.scrollHeight +
              measuresBefore.current.scrollTop
          })
        }
      }
    }
  }, [ref, measuresBefore, initDep, didUpdate, list])
}
