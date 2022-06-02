import { useCallback, useContext, useRef, useState } from 'react'

import { View, PanResponderGestureState, PanResponder } from 'react-native'

import { NotificationsDrawerNavigationContext } from '../NotificationsDrawerNavigationContext'

import { reactions, ReactionTypes } from './reactions'

type PositionEntries = [ReactionTypes, number][]

const reactionTypes: ReactionTypes[] = ['heart', 'fire', 'party', 'explode']
const width = 72

export const ReactionList = () => {
  const [
    selectedReaction,
    setSelectedReaction
  ] = useState<ReactionTypes | null>(null)
  const interactingRef = useRef<ReactionTypes | null>(null)
  const { setGesturesDisabled } = useContext(
    NotificationsDrawerNavigationContext
  )
  const [interacting, setInteracting] = useState<ReactionTypes | null>(null)
  const positions = useRef({
    fire: 0,
    heart: 0,
    party: 0,
    explode: 0
  })

  const handleGesture = useCallback(
    (_, gestureState: PanResponderGestureState) => {
      const { x0, moveX } = gestureState

      const positionEntires = Object.entries(
        positions.current
      ) as PositionEntries

      const currentReaction = positionEntires.find(([, x]) => {
        const currentPosition = moveX || x0
        return currentPosition > x && currentPosition <= x + width
      })

      if (currentReaction) {
        const [reactionType] = currentReaction
        interactingRef.current = reactionType
        setInteracting(reactionType as ReactionTypes)
      } else {
        interactingRef.current = null
        setInteracting(null)
      }
    },
    []
  )

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        setGesturesDisabled?.(true)
        handleGesture(e, gestureState)
      },
      onPanResponderMove: handleGesture,
      onPanResponderRelease: () => {
        setSelectedReaction(interactingRef.current)
        interactingRef.current = null
        setInteracting(null)
        setGesturesDisabled?.(false)
      },
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true
    })
  )

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center' }}
      {...panResponder.current.panHandlers}
    >
      {reactionTypes.map(reactionType => {
        const Reaction = reactions[reactionType]
        const status =
          interacting === reactionType
            ? 'interacting'
            : selectedReaction
            ? selectedReaction === reactionType
              ? 'selected'
              : 'unselected'
            : 'idle'
        return (
          <Reaction
            key={reactionType}
            status={status}
            onMeasure={({ x, width }: { x: number; width: number }) => {
              positions.current = {
                ...positions.current,
                [reactionType]: x
              }
            }}
          />
        )
      })}
    </View>
  )
}
