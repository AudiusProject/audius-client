import React from 'react'

import { useLeavingAudiusModal } from '@audius/common'
import { View } from 'react-native'

import IconExternalLink from 'app/assets/images/iconExternalLink.svg'
import IconInfo from 'app/assets/images/iconInfo.svg'
import Drawer from 'app/components/drawer/Drawer'
import { makeStyles } from 'app/styles'

import { Button, Text, useLink } from '../core'
import { HelpCallout } from '../help-callout/HelpCallout'

const messages = {
  title: 'Are You Sure?',
  content: 'This link is taking you to the following website',
  visit: 'Visit Site',
  back: 'Go Back'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    gap: spacing(4),
    paddingBottom: spacing(6),
    paddingHorizontal: spacing(4)
  },
  button: {
    width: '100%'
  }
}))

export const LeavingAudiusDrawer = () => {
  const styles = useStyles()
  const { isOpen, data, onClose, onClosed } = useLeavingAudiusModal()
  const { link } = data
  const { onPress: onLinkPress } = useLink(link)
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      onClosed={onClosed}
      title={messages.title}
      titleIcon={IconInfo}
    >
      <View style={styles.root}>
        <Text>{messages.content}</Text>
        <HelpCallout content={link} icon={IconExternalLink} />
        <Button
          style={styles.button}
          title={messages.visit}
          onPress={onLinkPress}
        />
        <Button
          style={styles.button}
          variant={'common'}
          title={messages.back}
          onPress={onClose}
        />
      </View>
    </Drawer>
  )
}
