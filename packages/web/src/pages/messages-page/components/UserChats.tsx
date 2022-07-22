import {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

import cn from 'classnames'
import { useSelector } from 'react-redux'

import { getAccountUser } from 'common/store/account/selectors'
import Input from 'components/data-entry/Input'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { initUserConnection } from 'services/waku/utils'
import { useWaku } from 'services/waku/wakuContext'

import styles from './UserChats.module.css'

export const messages = {
  title: 'Messages',
  description: 'Decentralized chat, end to end encrypted!'
}

export const UserSearch = (props: {
  className?: string
  addUserHandle: (handle: string) => void
}) => {
  const [userHandle, setUserHandle] = useState('')

  const handleKeyPress = ({ key }: KeyboardEvent<HTMLDivElement>) => {
    console.log({ key })
    if (key === 'Enter' && userHandle.trimLeft() !== '') {
      props.addUserHandle(userHandle)
      setUserHandle('')
    }
  }

  const onChange = (input: string) => {
    setUserHandle(input)
  }

  return (
    <div className={cn(props.className, styles.inputWrapper)}>
      <Input
        placeholder={'user handle'}
        size='medium'
        type='email'
        name='email'
        autoComplete='username'
        value={userHandle}
        variant={'normal'}
        onChange={onChange}
        onKeyDown={handleKeyPress}
        className={styles.userSearch}
      />
    </div>
  )
}

export const Converstation = (props: {
  className?: string
  user: {
    name: string
    handle: string
    profilePicture: string
    id: string
    wallet: string
  }
  topic: string
  resetMessages: () => void
}) => {
  const { waku, setActiveHandle, activeHandle } = useWaku()
  const currentUser = useSelector(getAccountUser)
  const onClick = () => {
    initUserConnection({
      waku,
      from: currentUser!.handle,
      handle: props.user.handle,
      publicKey: props.user.wallet,
      chatContentTopic: props.topic,
      // @ts-ignore
      messageSender: waku.relay.send.bind(waku.relay)
    }).then(() => {
      if (setActiveHandle) setActiveHandle(props.user.handle)
      props.resetMessages()
    })
  }

  return (
    <div
      className={cn(props.className, styles.converstaion, {
        [styles.isActive]: activeHandle === props.user.handle
      })}
      onClick={onClick}>
      <DynamicImage
        image={props.user.profilePicture}
        wrapperClassName={styles.userImage}
      />
      <div className={styles.info}>
        <div className={styles.name}>{props.user.name}</div>
        <div className={styles.handle}>{`@${props.user.handle}`}</div>
      </div>
    </div>
  )
}

const useGetUsersByHandle = ({ handles }: { handles: string[] }) => {
  const [state, setState] = useState('finished')
  const [users, setUsers] = useState<
    {
      name: string
      handle: string
      profilePicture: string
      id: string
      wallet: string
    }[]
  >([])
  useEffect(() => {
    setState('requesting')
  }, [handles])
  useEffect(() => {
    if (state === 'requesting') {
      setState('loading')
      const fetchUsers = async () => {
        await waitForLibsInit()
        const users = await Promise.all(
          handles.map(async (handle) => {
            try {
              const url = `${window.audiusLibs.discoveryProvider.discoveryProviderEndpoint}/v1/users/handle/${handle}`
              const res = await fetch(url)
              const user = await res.json()
              return user
            } catch (e) {
              return undefined
            }
          })
        )
        setUsers(
          users
            .filter((u) => u && u.data)
            .map((u: any) => {
              const user = u.data
              return {
                name: user.name,
                handle: user.handle,
                profilePicture: user?.profile_picture?.['150x150'],
                id: user.id,
                wallet: user.erc_wallet
              }
            })
        )
        setState('finished')
      }
      fetchUsers()
    }
  }, [state, handles])
  return users
}

export const UserConversations = (props: {
  className?: string
  handles: string[]
  topic: string
  resetMessages: () => void
}) => {
  const users = useGetUsersByHandle({ handles: props.handles })
  return (
    <div className={cn(props.className, styles.converstationsContainer)}>
      {users.map((user) => (
        <Converstation
          key={user.id}
          user={user}
          topic={props.topic}
          resetMessages={props.resetMessages}
        />
      ))}
    </div>
  )
}

export const UserChats = (props: {
  resetMessages: () => void
  className?: string
  handles: string[]
  topic: string
  addUserHandle: (handle: string) => void
}) => {
  return (
    <div className={props.className}>
      <UserSearch addUserHandle={props.addUserHandle} />
      <UserConversations
        handles={props.handles}
        topic={props.topic}
        resetMessages={props.resetMessages}
      />
    </div>
  )
}

export default UserChats
