import React, { useCallback, useEffect, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconLink,
  IconPencil,
  Modal
} from '@audius/stems'
import cn from 'classnames'
import styles from './CollectiblesPage.module.css'
import PerspectiveCard from 'components/perspective-card/PerspectiveCard'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'containers/user-badges/UserBadges'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import { ReactComponent as IconMute } from 'assets/img/iconVolume0.svg'
import { ReactComponent as IconPlay } from 'assets/img/pbIconPlay.svg'
import { ReactComponent as IconShow } from 'assets/img/iconMultiselectAdd.svg'
import { ReactComponent as IconHide } from 'assets/img/iconRemoveTrack.svg'
import { ReactComponent as IconDrag } from 'assets/img/iconDrag.svg'
import { ReactComponent as IconGradientCollectibles } from 'assets/img/iconGradientCollectibles.svg'
import Tooltip from 'components/tooltip/Tooltip'
import { Collectible, CollectiblesMetadata, CollectibleType } from './types'
import { ProfileUser } from 'containers/profile-page/store/types'
import { formatDate } from 'utils/timeUtil'
import Drawer from 'components/drawer/Drawer'
import Spin from 'antd/lib/spin'

const VISIBLE_COLLECTIBLES_DROPPABLE_ID = 'visible-collectibles-droppable'

const messages = {
  title: 'COLLECTIBLES',
  subtitlePrefix: 'A collection of NFT collectibles owned and created by '
}

// @ts-ignore
const VisibleCollectible = props => {
  const {
    name,
    imageUrl,
    isOwned,
    dateCreated,
    onHideClick,
    forwardRef,
    handleProps,
    ...otherProps
  } = props
  return (
    <div className={styles.editRow} ref={forwardRef} {...otherProps}>
      <Tooltip text='Hide collectible'>
        <IconHide onClick={onHideClick} />
      </Tooltip>
      <div className={styles.verticalDivider} />
      <div>
        <img
          className={styles.editMedia}
          src={imageUrl}
          alt='Visible collectible thumbnail'
        />
      </div>
      <div className={styles.editRowTitle}>{name}</div>
      <div>
        {isOwned ? (
          <span className={cn(styles.owned, styles.editStamp)}>OWNED</span>
        ) : (
          <span className={cn(styles.created, styles.editStamp)}>CREATED</span>
        )}
      </div>
      {dateCreated && <div>{formatDate(dateCreated)}</div>}
      <div className={styles.verticalDivider} />
      <div className={styles.drag} {...handleProps}>
        <IconDrag />
      </div>
    </div>
  )
}

const HiddenCollectible: React.FC<{
  name: string
  imageUrl: string
  isOwned: boolean
  dateCreated: string | null
  onShowClick: () => void
}> = props => {
  const { name, imageUrl, isOwned, dateCreated, onShowClick } = props
  return (
    <div className={cn(styles.editRow, styles.editHidden)}>
      <Tooltip className={styles.showButton} text='Show collectible'>
        <IconShow onClick={onShowClick} />
      </Tooltip>
      <div className={styles.verticalDivider} />
      <div>
        <img
          className={styles.editMedia}
          src={imageUrl}
          alt='Hidden collectible thumbnail'
        />
      </div>
      <div className={styles.editRowTitle}>{name}</div>
      <div>
        {isOwned ? (
          <span className={cn(styles.owned, styles.editStamp)}>OWNED</span>
        ) : (
          <span className={cn(styles.created, styles.editStamp)}>CREATED</span>
        )}
      </div>
      {dateCreated && <div>{formatDate(dateCreated)}</div>}
    </div>
  )
}

const CollectibleMedia: React.FC<{
  type: CollectibleType
  imageUrl: string | null
  animationUrl: string | null
  isMuted: boolean
  toggleMute: () => void
}> = ({ type, imageUrl, animationUrl, isMuted, toggleMute }) => {
  return type === CollectibleType.IMAGE ? (
    <div className={styles.modalMediaWrapper}>
      <DynamicImage image={imageUrl!} wrapperClassName={styles.modalMedia} />
    </div>
  ) : (
    <div className={styles.modalMediaWrapper} onClick={toggleMute}>
      <video className={styles.modalMedia} muted={isMuted} autoPlay loop>
        <source
          src={animationUrl!}
          type={`video/${animationUrl!.slice(
            animationUrl!.lastIndexOf('.') + 1
          )}`}
        />
        Your browser does not support the video tag.
      </video>
      {isMuted ? (
        <IconMute className={styles.volumeIcon} />
      ) : (
        <IconVolume className={styles.volumeIcon} />
      )}
    </div>
  )
}

const CollectibleDetails: React.FC<{
  collectible: Collectible
  isMobile: boolean
}> = ({ collectible, isMobile }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(true)

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      setIsDrawerOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }, [isMobile, setIsDrawerOpen, setIsModalOpen])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted, setIsMuted])

  return (
    <div
      className={cn(styles.detailsContainer, {
        [styles.mobileDetailsContainer]: isMobile
      })}
    >
      <PerspectiveCard
        className={styles.perspectiveCard}
        onClick={handleItemClick}
      >
        <div>
          <DynamicImage
            image={collectible.imageUrl!}
            wrapperClassName={styles.media}
          />
          {collectible.type === CollectibleType.VIDEO && (
            <IconPlay className={styles.playIcon} />
          )}
          <div className={styles.stamp}>
            {collectible.isOwned ? (
              <span className={styles.owned}>OWNED</span>
            ) : (
              <span className={styles.created}>CREATED</span>
            )}
          </div>
        </div>
        <div className={styles.nftTitle}>{collectible.name}</div>
      </PerspectiveCard>

      <Modal
        title='Collectible'
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        showTitleHeader
        showDismissButton
        bodyClassName={styles.modalBody}
        headerContainerClassName={styles.modalHeader}
        titleClassName={styles.modalTitle}
        allowScroll
      >
        <div className={styles.nftModal}>
          <CollectibleMedia
            type={collectible.type}
            imageUrl={collectible.imageUrl}
            animationUrl={collectible.animationUrl}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />

          <div className={styles.details}>
            <div className={styles.detailsTitle}>{collectible.name}</div>
            <div className={styles.detailsStamp}>
              {collectible.isOwned ? (
                <span className={styles.owned}>OWNED</span>
              ) : (
                <span className={styles.created}>CREATED</span>
              )}
            </div>

            <div>Date Created:</div>
            <div className={styles.date}>
              {collectible.dateCreated
                ? formatDate(collectible.dateCreated)
                : ''}
            </div>

            <div>Last Transferred:</div>
            <div className={styles.date}>
              {collectible.dateLastTransferred
                ? formatDate(collectible.dateLastTransferred)
                : ''}
            </div>

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
                Link To Collectible
              </a>
            )}
          </div>
        </div>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isFullscreen
      >
        <div className={styles.nftDrawer}>
          <CollectibleMedia
            type={collectible.type}
            imageUrl={collectible.imageUrl}
            animationUrl={collectible.animationUrl}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />

          <div className={styles.details}>
            <div className={styles.detailsTitle}>{collectible.name}</div>
            <div className={cn(styles.detailsStamp, styles.mobileDetailsStamp)}>
              {collectible.isOwned ? (
                <span className={styles.owned}>OWNED</span>
              ) : (
                <span className={styles.created}>CREATED</span>
              )}
            </div>

            <div className={styles.mobileDateWrapper}>
              <div>Date Created:</div>
              <div className={cn(styles.date, styles.mobileDate)}>
                {collectible.dateCreated
                  ? formatDate(collectible.dateCreated)
                  : ''}
              </div>
            </div>

            <div className={styles.mobileDateWrapper}>
              <div>Last Transferred:</div>
              <div className={cn(styles.date, styles.mobileDate)}>
                {collectible.dateLastTransferred
                  ? formatDate(collectible.dateLastTransferred)
                  : ''}
              </div>
            </div>

            <div
              className={cn(
                styles.detailsDescription,
                styles.mobileDetailsDescription
              )}
            >
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
                Link To Collectible
              </a>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  )
}

const CollectiblesPage: React.FC<{
  userId: number | null
  name: string
  isMobile: boolean
  isUserOnTheirProfile: boolean
  profile: ProfileUser
  updateProfile?: (metadata: any) => void
}> = ({
  userId,
  name,
  isMobile,
  profile,
  updateProfile,
  isUserOnTheirProfile
}) => {
  const isLoading = profile.collectibleList === undefined

  const collectibleList = profile.collectibleList || []

  const [
    collectiblesMetadata,
    setCollectiblesMetadata
  ] = useState<CollectiblesMetadata | null>(profile.collectibles || null)

  const [isEditingPreferences, setIsEditingPreferences] = useState<boolean>(
    false
  )
  const [showUseDesktopDrawer, setShowUseDesktopDrawer] = useState<boolean>(
    false
  )

  useEffect(() => {
    if (!collectiblesMetadata) {
      /**
       * set local collectible preferences if user never saved them before
       */
      setCollectiblesMetadata({
        ...collectibleList.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: {} }),
          {}
        ),
        order: collectibleList.map(c => c.id)
      })
    } else {
      /**
       * include collectibles returned by OpenSea which have not been stored in the user preferences
       */
      const collectiblesMetadataKeySet = new Set(
        Object.keys(collectiblesMetadata)
      )
      const newCollectiblesMap = collectibleList
        .map(c => c.id)
        .filter(id => !collectiblesMetadataKeySet.has(id))
        .reduce((acc, curr) => ({ ...acc, [curr]: {} }), {})

      setCollectiblesMetadata({
        ...collectiblesMetadata,
        ...newCollectiblesMap,
        order: collectiblesMetadata.order.concat(
          Object.keys(newCollectiblesMap)
        )
      })
    }
    // eslint-disable-next-line
  }, [])

  const handleEditClick = useCallback(() => {
    if (isMobile) {
      setShowUseDesktopDrawer(true)
    } else {
      setIsEditingPreferences(true)
    }
  }, [isMobile, setShowUseDesktopDrawer, setIsEditingPreferences])

  const handleDoneClick = useCallback(() => {
    setIsEditingPreferences(false)
    if (updateProfile) {
      updateProfile({
        ...profile,
        has_collectibles: true,
        collectibles: { ...collectiblesMetadata }
      })
    }
  }, [setIsEditingPreferences, updateProfile, profile, collectiblesMetadata])

  const handleShowCollectible = useCallback(
    (id: string) => () => {
      setCollectiblesMetadata({
        ...collectiblesMetadata,
        order: (collectiblesMetadata?.order ?? []).concat(id)
      })
    },
    [setCollectiblesMetadata, collectiblesMetadata]
  )

  const handleHideCollectible = useCallback(
    (id: string) => () => {
      setCollectiblesMetadata({
        ...collectiblesMetadata,
        [id]: collectiblesMetadata?.id ?? {},
        order: (collectiblesMetadata?.order ?? []).filter(
          tokenId => tokenId !== id
        )
      })
    },
    [setCollectiblesMetadata, collectiblesMetadata]
  )

  const onDragEnd = (result: any) => {
    const { source, destination } = result

    if (!destination || destination.index === source.index) {
      return
    }

    let newCollectibleList = getVisibleCollectibles()
    const sourceCollectible = newCollectibleList.splice(source.index, 1)[0]
    newCollectibleList = newCollectibleList
      .slice(0, destination.index)
      .concat(sourceCollectible)
      .concat(newCollectibleList.slice(destination.index))

    setCollectiblesMetadata({
      ...collectiblesMetadata,
      order: newCollectibleList
        .map(c => c.id)
        .filter(id => (collectiblesMetadata?.order || []).includes(id))
    })
  }

  const getVisibleCollectibles = useCallback(() => {
    if (collectiblesMetadata?.order === undefined) {
      return [...collectibleList]
    }

    const collectibleMap: {
      [key: string]: Collectible
    } = collectibleList.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {})
    const collectibleKeySet = new Set(Object.keys(collectibleMap))

    return collectiblesMetadata.order
      .filter(id => collectibleKeySet.has(id))
      .map(id => collectibleMap[id])
  }, [collectiblesMetadata, collectibleList])

  const getHiddenCollectibles = useCallback(() => {
    const visibleCollectibleKeySet = new Set(
      getVisibleCollectibles().map(c => c.id)
    )
    return collectibleList.filter(c => !visibleCollectibleKeySet.has(c.id))
  }, [getVisibleCollectibles, collectibleList])

  return (
    <div className={styles.collectiblesWrapper}>
      <div className={styles.wrapper}>
        <div className={cn(styles.header, { [styles.mobileHeader]: isMobile })}>
          <div className={styles.headerText}>
            <div className={styles.title}>{messages.title}</div>
            <div
              className={cn(styles.subtitle, {
                [styles.mobileSubtitle]: isMobile
              })}
            >
              {`${messages.subtitlePrefix}${name}`}
              {userId && (
                <UserBadges
                  className={styles.badges}
                  userId={userId}
                  badgeSize={12}
                />
              )}
            </div>
          </div>

          {isUserOnTheirProfile && (
            <Button
              type={ButtonType.COMMON}
              size={ButtonSize.TINY}
              text='EDIT'
              leftIcon={<IconPencil />}
              onClick={handleEditClick}
            />
          )}
        </div>

        <div
          className={cn(styles.content, { [styles.mobileContent]: isMobile })}
        >
          {isLoading && (
            <div className={styles.spinnerContainer}>
              <Spin className={styles.spinner} size='large' />
            </div>
          )}
          {!isLoading && !getVisibleCollectibles().length && (
            <div className={styles.noVisibleCollectible}>
              Visitors to your profile won&#39;t see this tab until you show at
              least one NFT Collectible.
            </div>
          )}
          {!isLoading && (
            <div className={styles.container}>
              {getVisibleCollectibles().map(collectible => (
                <CollectibleDetails
                  key={collectible.id}
                  collectible={collectible}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title='Sort Your Collectibles'
        isOpen={isEditingPreferences}
        onClose={() => setIsEditingPreferences(false)}
        showTitleHeader
        showDismissButton
        bodyClassName={cn(styles.modalBody, styles.editModalBody)}
        headerContainerClassName={styles.modalHeader}
        titleClassName={styles.modalTitle}
        allowScroll
      >
        <div className={styles.editModal}>
          <div className={styles.editListSection}>
            <DragDropContext onDragEnd={onDragEnd}>
              <div className={styles.editListHeader}>Visible Collectibles</div>

              <div className={styles.editTableContainer}>
                <Droppable droppableId={VISIBLE_COLLECTIBLES_DROPPABLE_ID}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {getVisibleCollectibles().map((c, index) => (
                        <Draggable key={c.id} draggableId={c.id} index={index}>
                          {(provided, snapshot) => (
                            <VisibleCollectible
                              {...provided.draggableProps}
                              handleProps={provided.dragHandleProps}
                              forwardRef={provided.innerRef}
                              name={c.name}
                              imageUrl={c.imageUrl}
                              isOwned={c.isOwned}
                              dateCreated={c.dateCreated}
                              onHideClick={handleHideCollectible(c.id)}
                            />
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          </div>

          <div className={styles.editListSection}>
            <div className={styles.editListHeader}>Hidden Collectibles</div>

            <div className={styles.editTableContainer}>
              {getHiddenCollectibles().map(c => (
                <HiddenCollectible
                  key={c.id}
                  name={c.name!}
                  imageUrl={c.imageUrl!}
                  isOwned={c.isOwned}
                  dateCreated={c.dateCreated}
                  onShowClick={handleShowCollectible(c.id)}
                />
              ))}
            </div>
          </div>

          <Button
            className={styles.editDoneButton}
            type={ButtonType.PRIMARY_ALT}
            size={ButtonSize.SMALL}
            text='Done'
            onClick={handleDoneClick}
          />
        </div>
      </Modal>

      <Drawer
        isOpen={showUseDesktopDrawer}
        onClose={() => setShowUseDesktopDrawer(false)}
      >
        <div className={styles.editDrawer}>
          <IconGradientCollectibles className={styles.editDrawerIcon} />
          <div className={styles.editDrawerTitle}>Edit Collectibles</div>
          <div className={styles.editDrawerContent}>
            Visit audius.co from a desktop browser to hide and sort your NFT
            collectibles.
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default CollectiblesPage
