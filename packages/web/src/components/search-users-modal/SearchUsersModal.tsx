import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import {
  cacheUsersSelectors,
  Modals,
  searchUsersModalSelectors,
  searchUsersModalActions,
  useProxySelector,
  User,
  ID,
  Status
} from '@audius/common'
import {
  IconSearch,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalTitleProps,
  Scrollbar
} from '@audius/stems'
import InfiniteScroll from 'react-infinite-scroller'
import { useDispatch, useSelector } from 'react-redux'
import { useDebounce } from 'react-use'

import { useModalState } from 'common/hooks/useModalState'
import { InputV2, InputV2Size } from 'components/data-entry/InputV2'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './SearchUsersModal.module.css'

const messages = {
  searchUsers: 'Search Users'
}

const DEBOUNCE_MS = 100

const { searchUsers } = searchUsersModalActions
const { getUserList } = searchUsersModalSelectors
const { getUsers } = cacheUsersSelectors

type SearchUsersModalProps = {
  modalName: Modals
  titleProps: ModalTitleProps
  debounceMs?: number
  defaultUserList?: {
    userIds: ID[]
    loadMore: () => void
    loading: boolean
    hasMore: boolean
  }
  renderUser: (user: User, closeModal: () => void) => ReactNode
}

export const SearchUsersModal = (props: SearchUsersModalProps) => {
  const {
    modalName,
    titleProps,
    debounceMs = DEBOUNCE_MS,
    defaultUserList = {
      userIds: [],
      loading: false,
      loadMore: () => {},
      hasMore: false
    },
    renderUser
  } = props
  const dispatch = useDispatch()
  const [isVisible, setIsVisible] = useModalState(modalName)
  const [query, setQuery] = useState('')
  const [hasQuery, setHasQuery] = useState(false)
  const scrollParentRef = useRef<HTMLElement | null>(null)

  const { userIds, hasMore, status } = useSelector(getUserList)
  const users = useProxySelector(
    (state) => {
      const ids = hasQuery ? userIds : defaultUserList.userIds
      const users = getUsers(state, { ids })
      return ids.map((id) => users[id])
    },
    [hasQuery, userIds, isVisible]
  )

  useDebounce(
    () => {
      dispatch(searchUsers({ query }))
      setHasQuery(!!query)
    },
    debounceMs,
    [query, setHasQuery, dispatch]
  )

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
    },
    [setQuery]
  )

  const handleLoadMore = useCallback(() => {
    if (status === Status.LOADING || defaultUserList.loading) {
      return
    }
    if (hasQuery) {
      dispatch(searchUsers({ query }))
    } else {
      defaultUserList.loadMore()
    }
  }, [hasQuery, query, status, defaultUserList, dispatch])

  useEffect(() => {
    if (isVisible) {
      setQuery('')
    }
  }, [isVisible, setQuery])

  return (
    <Modal isOpen={isVisible} onClose={handleClose}>
      <ModalHeader onClose={handleClose}>
        <ModalTitle iconClassName={styles.icon} {...titleProps}></ModalTitle>
      </ModalHeader>
      <div className={styles.modalContent}>
        <div className={styles.search}>
          <InputV2
            placeholder={messages.searchUsers}
            size={InputV2Size.LARGE}
            value={query}
            onChange={handleChange}
          >
            <IconSearch className={styles.iconLight} />
          </InputV2>
        </div>
        <Scrollbar
          className={styles.results}
          containerRef={(containerRef) => {
            scrollParentRef.current = containerRef
          }}
        >
          <InfiniteScroll
            loadMore={handleLoadMore}
            useWindow={false}
            initialLoad
            hasMore={hasQuery ? hasMore : defaultUserList.hasMore}
            getScrollParent={() => scrollParentRef.current}
            loader={<LoadingSpinner className={styles.spinner} />}
            threshold={48}
          >
            {users.map((user) => renderUser(user, handleClose))}
          </InfiniteScroll>
        </Scrollbar>
      </div>
    </Modal>
  )
}
