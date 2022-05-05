export {}
// import React from 'react'
//
// import { TipSent } from 'common/store/notifications/types'
//
// import { NotificationBody } from './NotificationBody'
// import { NotificationFooter } from './NotificationFooter'
// import { NotificationHeader } from './NotificationHeader'
// import { NotificationTile } from './NotificationTile'
// import { NotificationTitle } from './NotificationTitle'
// import { TwitterShareButton } from './TwitterShareButton'
// import { UserNameLink } from './UserNameLink'
// import { IconTip } from './icons'
//
// const messages = {
//   title: 'You Received a Tip!',
//   sent: 'sent you a tip of',
//   audio: '$AUDIO',
//   thanks: 'Say Thanks With a Reaction'
// }
//
// type TipReceivedNotificationProps = {
//   notification: TipSent
// }
//
// export const TipReceivedNotification = (
//   props: TipReceivedNotificationProps
// ) => {
//   const { notification } = props
//   const { user, value, timeLabel, isRead } = notification
//
//   return (
//     <NotificationTile notification={notification}>
//       <NotificationHeader icon={<IconTip />}>
//         <NotificationTitle>{messages.title}</NotificationTitle>
//       </NotificationHeader>
//       <NotificationBody>
//         <UserNameLink user={user} notification={notification} /> {messages.sent}{' '}
//         {value} {messages.audio}
//       </NotificationBody>
//       {messages.thanks}
//       <TwitterShareButton />
//       <NotificationFooter timeLabel={timeLabel} isRead={isRead} />
//     </NotificationTile>
//   )
// }
