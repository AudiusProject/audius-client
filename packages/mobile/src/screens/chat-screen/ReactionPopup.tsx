import type { ReactionTypes } from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { View, Dimensions, Pressable } from 'react-native'

import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { ReactionList } from '../notifications-screen/Reaction'

import { ChatMessageListItem } from './ChatMessageListItem'

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  reactionsContainer: {
    display: 'flex',
    borderWidth: 1,
    borderRadius: spacing(3),
    borderColor: palette.neutralLight9,
    zIndex: 4,
    width: Dimensions.get('window').width - spacing(10),
    backgroundColor: palette.white,
    marginHorizontal: spacing(5)
  },
  popupContainer: {
    position: 'absolute',
    display: 'flex',
    flex: 1,
    zIndex: 2,
    overflow: 'hidden'
  },
  dimBackground: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    opacity: 0.3,
    backgroundColor: 'black',
    zIndex: 2,
    flex: 1
  },
  innerPressable: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 3,
    flex: 1
  },
  popupChatMessage: {
    position: 'absolute',
    maxWidth: Dimensions.get('window').width - spacing(12),
    zIndex: 4
  }
}))

type ReactionPopupProps = {
  containerTop: number
  containerBottom: number
  messageTop: number
  reactionTop: number
  selectedReaction: ReactionTypes
  isAuthor: boolean
  hasTail: boolean
  message: ChatMessage
  closePopup: () => void
  handleReactionSelected: (reaction: ReactionTypes) => void
}

export const ReactionPopup = ({
  containerTop,
  containerBottom,
  messageTop,
  reactionTop,
  selectedReaction,
  isAuthor,
  hasTail,
  message,
  closePopup,
  handleReactionSelected
}: ReactionPopupProps) => {
  const styles = useStyles()

  return (
    <>
      <Pressable style={styles.dimBackground} onPress={closePopup} />
      {/* This view cuts off the message body when it goes beyond the
      boundaries of the flatlist view. */}
      <View
        style={[
          styles.popupContainer,
          {
            top: containerTop,
            height: containerBottom - containerTop
          }
        ]}
      >
        {/* This 2nd pressable ensures that clicking outside of the
        message and reaction list, but inside of flatlist view,
        closes the poup. */}
        <Pressable style={styles.innerPressable} onPress={closePopup} />
        <ChatMessageListItem
          message={message}
          hasTail={hasTail}
          ref={() => null}
          shouldShowDate={false}
          style={[
            styles.popupChatMessage,
            {
              top: messageTop,
              alignSelf: isAuthor ? 'flex-end' : 'flex-start',
              right: isAuthor ? spacing(6) : undefined,
              left: !isAuthor ? spacing(6) : undefined
            }
          ]}
        />
        <View style={[styles.reactionsContainer, { top: reactionTop }]}>
          <ReactionList
            selectedReaction={selectedReaction}
            onChange={(reaction) => {
              if (reaction) {
                handleReactionSelected(reaction)
              }
            }}
            isVisible={true}
          />
        </View>
      </View>
    </>
  )
}
