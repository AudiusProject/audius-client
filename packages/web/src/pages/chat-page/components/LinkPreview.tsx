import { useEffect } from 'react'

import { CommonState, chatActions, chatSelectors } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import styles from './LinkPreview.module.css'

const { getUnfurlMetadata } = chatSelectors
const { fetchLinkUnfurl } = chatActions

type LinkPreviewProps = {
  href: string
  chatId: string
  messageId: string
}
export const LinkPreview = (props: LinkPreviewProps) => {
  const { href, chatId, messageId } = props
  const dispatch = useDispatch()

  const metadata = useSelector((state: CommonState) =>
    getUnfurlMetadata(state, chatId, messageId)
  )
  const domain = metadata?.url ? new URL(metadata?.url).hostname : ''

  useEffect(() => {
    if (!metadata) {
      dispatch(fetchLinkUnfurl({ chatId, messageId, href }))
    }
  }, [metadata, dispatch, chatId, messageId, href])

  if (!metadata) {
    return null
  }

  return (
    <a
      className={styles.root}
      href={href}
      title={
        metadata.title ||
        metadata.site_name ||
        metadata.description ||
        'View Image'
      }
      target={'_blank'}
      rel='noreferrer'
    >
      {metadata.description || metadata.title ? (
        <>
          {metadata.image ? (
            <span className={styles.thumbnail}>
              <img src={metadata.image} alt={metadata.site_name} />
            </span>
          ) : null}
          <span className={styles.domain}>{domain}</span>
          <span className={styles.text}>
            {metadata.title ? (
              <span className={styles.title}>{metadata.title}</span>
            ) : null}
            {metadata.description ? (
              <span className={styles.description}>{metadata.description}</span>
            ) : null}
          </span>
        </>
      ) : metadata.image ? (
        <span>
          <img
            className={styles.image}
            src={metadata.image}
            alt={metadata.site_name}
          />
        </span>
      ) : null}
    </a>
  )
}
