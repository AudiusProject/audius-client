import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { Chain, Collectible, CollectibleMediaType } from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconImage,
  IconLink,
  IconShare,
  LogoEth,
  LogoSol,
  Modal
} from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconEmbed } from 'assets/img/iconEmbed.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import { ReactComponent as IconMute } from 'assets/img/iconVolume0.svg'
import { useModalState } from 'common/hooks/useModalState'
import { useSelectTierInfo } from 'common/hooks/wallet'
import { getAccountUser } from 'common/store/account/selectors'
import {
  getCollectibleDetails,
  getCollectible
} from 'common/store/ui/collectible-details/selectors'
import { setCollectible } from 'common/store/ui/collectible-details/slice'
import { badgeTiers } from 'common/store/wallet/utils'
import { formatDateWithTimezoneOffset } from 'common/utils/timeUtil'
import Drawer from 'components/drawer/Drawer'
import Toast from 'components/toast/Toast'
import { ToastContext } from 'components/toast/ToastContext'
import Tooltip from 'components/tooltip/Tooltip'
import { ComponentPlacement, MountPlacement } from 'components/types'
import { useScript } from 'hooks/useScript'
import { MIN_COLLECTIBLES_TIER } from 'pages/profile-page/ProfilePageProvider'
import { useIsMobile } from 'utils/clientUtil'
import { copyToClipboard, getCopyableLink } from 'utils/clipboardUtil'
import { getScrollParent } from 'utils/scrollParent'
import zIndex from 'utils/zIndex'

import { collectibleMessages } from './CollectiblesPage'
import styles from './CollectiblesPage.module.css'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const MODEL_VIEWER_SCRIPT_URL =
  'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'

type CollectibleMediaProps = {
  collectible: Collectible
  isMuted: boolean
  toggleMute: () => void
  isMobile: boolean
}

const CollectibleMedia = (props: CollectibleMediaProps) => {
  const { collectible, isMuted, toggleMute, isMobile } = props
  // if it becomes possible to render more than 1 collectible detail (model or mobile drawer), then
  // update useScript hook to handle multiple in-flight requests
  const scriptLoaded = useScript(MODEL_VIEWER_SCRIPT_URL, true)

  const { mediaType, imageUrl, videoUrl, gifUrl, threeDUrl } = collectible

  const [isSvg, setIsSvg] = useState(false)

  // check for svg images to give them non-empty width
  const handleImage = useCallback(
    (imageContainer: HTMLDivElement | null) => {
      if (
        mediaType === CollectibleMediaType.IMAGE &&
        imageUrl?.endsWith('.svg') &&
        imageContainer &&
        getComputedStyle(imageContainer).width === '0px'
      ) {
        setIsSvg(true)
      }
    },
    [mediaType, imageUrl, setIsSvg]
  )

  const ref3D = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (threeDUrl && ref3D?.current && scriptLoaded) {
      ref3D.current.innerHTML = `<model-viewer src=${threeDUrl} auto-rotate camera-controls />`
      const modelViewer = ref3D.current.children[0] as HTMLElement
      modelViewer.style.minWidth = '50vw'
      modelViewer.style.minHeight = '50vh'

      if (isMobile) {
        modelViewer.style.width = '100%'

        // for 3d objects, disable parent nft drawer element scrollability if user is on 3d object
        const scrollableAncestor = getScrollParent(modelViewer)
        let foundDrawerAncestor = false
        for (const item of (scrollableAncestor?.classList ?? []).values()) {
          if (item.includes('nftDrawer')) {
            foundDrawerAncestor = true
            break
          }
        }
        if (foundDrawerAncestor) {
          const scrollableAncestorElement = scrollableAncestor as HTMLElement
          const mouseEnterListener = () => {
            scrollableAncestorElement.style.overflowY = 'hidden'
            console.log(scrollableAncestorElement.style.overflowY)
          }
          const mouseLeaveListener = () => {
            scrollableAncestorElement.style.overflowY = 'scroll'
            console.log(scrollableAncestorElement.style.overflowY)
          }
          modelViewer.addEventListener('mouseenter', mouseEnterListener)
          modelViewer.addEventListener('mouseleave', mouseLeaveListener)

          return () => {
            modelViewer.removeEventListener('mouseenter', mouseEnterListener)
            modelViewer.removeEventListener('mouseleave', mouseLeaveListener)
          }
        }
      }
    }
  }, [threeDUrl, ref3D, isMobile, scriptLoaded])

  return mediaType === CollectibleMediaType.THREE_D ? (
    <div className={styles.detailsMediaWrapper} ref={ref3D} />
  ) : mediaType === CollectibleMediaType.GIF ? (
    <div className={styles.detailsMediaWrapper}>
      <img src={gifUrl!} alt='Collectible' />
    </div>
  ) : mediaType === CollectibleMediaType.VIDEO ? (
    <div className={styles.detailsMediaWrapper} onClick={toggleMute}>
      <video muted={isMuted} autoPlay loop playsInline src={videoUrl!}>
        {collectibleMessages.videoNotSupported}
      </video>
      {isMuted ? (
        <IconMute className={styles.volumeIcon} />
      ) : (
        <IconVolume className={styles.volumeIcon} />
      )}
    </div>
  ) : (
    <div
      className={cn(styles.detailsMediaWrapper, { [styles.svg]: isSvg })}
      ref={handleImage}
    >
      <img src={imageUrl!} alt='Collectible' />
    </div>
  )
}

const CollectibleDetailsModal = ({
  isMobile,
  handle,
  onSave,
  updateProfilePicture,
  isUserOnTheirProfile,
  shareUrl,
  setIsEmbedModalOpen,
  onClose
}: {
  isMobile: boolean
  handle: string | null
  onSave?: () => void
  updateProfilePicture?: (
    selectedFiles: any,
    source: 'original' | 'unsplash' | 'url'
  ) => void
  isUserOnTheirProfile: boolean
  shareUrl: string
  setIsEmbedModalOpen?: (val: boolean) => void
  onClose?: () => void
}) => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)
  const [isModalOpen, setIsModalOpen] = useModalState('CollectibleDetails')
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const collectible = useSelector(getCollectible)

  const [isPicConfirmModalOpen, setIsPicConfirmaModalOpen] =
    useState<boolean>(false)

  const accountUser = useSelector(getAccountUser)
  const userId = accountUser?.user_id ?? 0
  const { tierNumber } = useSelectTierInfo(userId)

  const isCollectibleOptionEnabled =
    tierNumber >= badgeTiers.findIndex((t) => t.tier === MIN_COLLECTIBLES_TIER)

  const handleClose = useCallback(() => {
    dispatch(setCollectible({ collectible: null }))
    setIsModalOpen(false)
    if (onClose) {
      // Ignore needed bc typescript doesn't think that match.params has handle property
      // @ts-ignore
      const url = `/${handle}/collectibles`
      // Push window state as to not trigger router change & component remount
      window.history.pushState('', '', url)
      onClose?.()
    }
  }, [dispatch, setIsModalOpen, onClose, handle])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted, setIsMuted])

  const handleMobileShareClick = useCallback(() => {
    copyToClipboard(shareUrl)
    toast(collectibleMessages.copied)
  }, [shareUrl, toast])

  if (!collectible) return <></>

  const onClickProfPicUpload = async () => {
    const { imageUrl } = collectible
    if (!updateProfilePicture || !onSave || imageUrl === null) return

    const blob = await fetch(imageUrl).then((r) => r.blob())
    await updateProfilePicture([blob], 'url')
    await onSave()
    setIsPicConfirmaModalOpen(false)
  }

  return (
    <>
      <Modal
        title='Collectible'
        isOpen={isModalOpen && !isMobile}
        onClose={handleClose}
        showTitleHeader
        showDismissButton
        bodyClassName={styles.modalBody}
        headerContainerClassName={styles.modalHeader}
        titleClassName={styles.modalTitle}
        allowScroll
        zIndex={zIndex.COLLECTIBLE_DETAILS_MODAL}
      >
        <div className={styles.nftModal}>
          <CollectibleMedia
            collectible={collectible}
            isMuted={isMuted}
            toggleMute={toggleMute}
            isMobile={isMobile}
          />

          <div className={styles.details}>
            <div className={styles.detailsTitle}>{collectible.name}</div>
            <div className={styles.detailsStamp}>
              {collectible.isOwned ? (
                <span className={styles.owned}>
                  {collectibleMessages.owned}
                </span>
              ) : (
                <span className={styles.created}>
                  {collectibleMessages.created}
                </span>
              )}

              {collectible.chain === Chain.Eth ? (
                <Tooltip text='Ethereum' mount={MountPlacement.PARENT}>
                  <LogoEth className={styles.chainIcon} />
                </Tooltip>
              ) : (
                <Tooltip text='Solana' mount={MountPlacement.PARENT}>
                  <LogoSol className={styles.chainIcon} />
                </Tooltip>
              )}
            </div>

            {collectible.dateCreated && (
              <div className={styles.dateWrapper}>
                <div className={styles.dateTitle}>Date Created:</div>
                <div className={styles.date}>
                  {formatDateWithTimezoneOffset(collectible.dateCreated)}
                </div>
              </div>
            )}

            {collectible.dateLastTransferred && (
              <div className={styles.dateWrapper}>
                <div className={styles.dateTitle}>Last Transferred:</div>
                <div className={styles.date}>
                  {formatDateWithTimezoneOffset(
                    collectible.dateLastTransferred
                  )}
                </div>
              </div>
            )}

            <div className={styles.detailsDescription}>
              {collectible.description}
            </div>

            {collectible.externalLink && (
              <a
                className={styles.link}
                href={collectible.externalLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <IconLink className={styles.linkIcon} />
                {new URL(collectible.externalLink).hostname}
              </a>
            )}

            {collectible.permaLink && (
              <a
                className={styles.link}
                href={collectible.permaLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <IconLink className={styles.linkIcon} />
                {collectibleMessages.linkToCollectible}
              </a>
            )}

            <div className={styles.detailsButtonContainer}>
              <Toast
                text={collectibleMessages.copied}
                fillParent={false}
                mount={MountPlacement.PARENT}
                placement={ComponentPlacement.TOP}
                requireAccount={false}
                tooltipClassName={styles.shareTooltip}
              >
                <Button
                  className={styles.detailsButton}
                  textClassName={styles.detailsButtonText}
                  iconClassName={styles.detailsButtonIcon}
                  onClick={() => copyToClipboard(shareUrl)}
                  text='Share'
                  type={ButtonType.COMMON_ALT}
                  size={ButtonSize.SMALL}
                  leftIcon={<IconShare />}
                />
              </Toast>

              <Button
                className={styles.detailsButton}
                textClassName={styles.detailsButtonText}
                iconClassName={styles.detailsButtonIcon}
                onClick={() => setIsEmbedModalOpen?.(true)}
                text='Embed'
                type={ButtonType.COMMON_ALT}
                size={ButtonSize.SMALL}
                leftIcon={<IconEmbed />}
              />

              {isCollectibleOptionEnabled &&
                isUserOnTheirProfile &&
                collectible.mediaType === CollectibleMediaType.IMAGE && (
                  <Button
                    className={styles.detailsButton}
                    textClassName={styles.detailsButtonText}
                    iconClassName={styles.detailsButtonIcon}
                    onClick={() => {
                      setIsModalOpen(false)
                      setIsPicConfirmaModalOpen(true)
                    }}
                    text='Set As Profile Pic'
                    type={ButtonType.COMMON_ALT}
                    size={ButtonSize.SMALL}
                    leftIcon={<IconImage />}
                  />
                )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        showTitleHeader
        showDismissButton
        headerContainerClassName={styles.modalHeader}
        isOpen={isPicConfirmModalOpen}
        onClose={() => setIsPicConfirmaModalOpen(false)}
        titleClassName={styles.confirmModalTitle}
        title={
          <>
            <IconImage />
            <span>Set as Profile Pic</span>
          </>
        }
      >
        <div className={styles.confirmModalContainer}>
          <p className={styles.confirmModalText}>
            Are you sure you want to change your profile picture?
          </p>

          <div className={styles.confirmButtonContainer}>
            <Button
              className={styles.profPicConfirmButton}
              onClick={() => setIsPicConfirmaModalOpen(false)}
              text='Nevermind'
              type={ButtonType.COMMON_ALT}
            />
            <Button
              className={styles.profPicConfirmButton}
              onClick={onClickProfPicUpload}
              text='Yes'
              type={ButtonType.PRIMARY_ALT}
            />
          </div>
        </div>
      </Modal>

      <Drawer
        isOpen={isModalOpen && isMobile && !NATIVE_MOBILE}
        onClose={handleClose}
        isFullscreen
      >
        <div className={styles.nftDrawer}>
          <CollectibleMedia
            collectible={collectible}
            isMuted={isMuted}
            toggleMute={toggleMute}
            isMobile={isMobile}
          />

          <div className={styles.details}>
            <div className={styles.detailsTitle}>{collectible.name}</div>
            <div className={styles.detailsStamp}>
              {collectible.isOwned ? (
                <span className={styles.owned}>
                  {collectibleMessages.owned}
                </span>
              ) : (
                <span className={styles.created}>
                  {collectibleMessages.created}
                </span>
              )}

              {collectible.chain === Chain.Eth ? (
                <LogoEth className={styles.chainIcon} />
              ) : (
                <LogoSol className={styles.chainIcon} />
              )}
            </div>

            {collectible.dateCreated && (
              <div className={styles.dateWrapper}>
                <div className={styles.dateTitle}>Date Created:</div>
                <div className={styles.date}>
                  {formatDateWithTimezoneOffset(collectible.dateCreated)}
                </div>
              </div>
            )}

            {collectible.dateLastTransferred && (
              <div className={styles.dateWrapper}>
                <div className={styles.dateTitle}>Last Transferred:</div>
                <div className={styles.date}>
                  {formatDateWithTimezoneOffset(
                    collectible.dateLastTransferred
                  )}
                </div>
              </div>
            )}

            <div className={styles.detailsDescription}>
              {collectible.description}
            </div>

            {collectible.externalLink && (
              <a
                className={styles.link}
                href={collectible.externalLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <IconLink className={styles.linkIcon} />
                {new URL(collectible.externalLink).hostname}
              </a>
            )}
            {collectible.permaLink && (
              <a
                className={styles.link}
                href={collectible.permaLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <IconLink className={styles.linkIcon} />
                {collectibleMessages.linkToCollectible}
              </a>
            )}

            <Button
              className={cn(styles.detailsButton, styles.mobileDetailsButton)}
              textClassName={styles.detailsButtonText}
              iconClassName={styles.detailsButtonIcon}
              onClick={handleMobileShareClick}
              text='Share'
              type={ButtonType.COMMON_ALT}
              size={ButtonSize.SMALL}
              leftIcon={<IconShare />}
            />
          </div>
        </div>
      </Drawer>
    </>
  )
}

const ConnectedCollectibleDetailsModal = () => {
  const isMobile = useIsMobile()
  const {
    ownerHandle,
    embedCollectibleHash,
    isUserOnTheirProfile,
    updateProfilePicture,
    onSave,
    setIsEmbedModalOpen,
    onClose
  } = useSelector(getCollectibleDetails)

  const shareUrl = useMemo(() => {
    return getCopyableLink(
      `/${ownerHandle}/collectibles${
        embedCollectibleHash ? `/${embedCollectibleHash}` : ''
      }`
    )
  }, [ownerHandle, embedCollectibleHash])

  return (
    <CollectibleDetailsModal
      isMobile={isMobile}
      handle={ownerHandle}
      isUserOnTheirProfile={isUserOnTheirProfile}
      updateProfilePicture={updateProfilePicture}
      onSave={onSave}
      shareUrl={shareUrl}
      setIsEmbedModalOpen={setIsEmbedModalOpen}
      onClose={onClose}
    />
  )
}

export default ConnectedCollectibleDetailsModal
