import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import cn from 'classnames'
import Card from '../card/Card'
import styles from './CollectibleGallery.module.css'
import CollectibleDetailsView from './CollectibleDetailsView'
import CollectiblesHeader from './CollectiblesHeader'
import CollectibleTile from './CollectibleTile'
import { fetchJsonFromCID } from '../../util/fetchCID'

const CollectibleGallery = ({
  collectibles,
  user,
  isTwitter,
  backgroundColor
}) => {
  const [modalCollectible, setModalCollectible] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [order, setOrder] = useState(null)

  const fetchCollectiblesOrder = async () => {
    const result = await fetchJsonFromCID(user.metadata_multihash)
    if (result && result.collectibles && result.collectibles.order) setOrder(result.collectibles.order)
  }

  useEffect(() => { fetchCollectiblesOrder() }, [])

  const collectiblesArray = order
    ? order.map(collectibleId => collectibles.find(c => c.id === collectibleId))
    : collectibles

  return (
    <Card
      isTwitter={isTwitter}
      backgroundColor={backgroundColor}
      className={styles.card}
    >
      <div className={styles.container}>
        <CollectiblesHeader
          user={user}
          backButtonVisible={isModalOpen}
          onBackButtonClick={() => {
            setModalCollectible({})
            setIsModalOpen(false)
          }}
        />
        <div className={styles.collectiblesContainer}>
          {collectiblesArray.map(collectible => (
            <div className={styles.imgContainer}>
              <CollectibleTile
                key={collectible.id}
                collectible={collectible}
                onClick={() => {
                  setModalCollectible(collectible)
                  setIsModalOpen(true)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <div className={cn(styles.detailsModal, { [styles.isOpen]: isModalOpen })}>
        <CollectibleDetailsView
          collectible={modalCollectible}
          user={user}
          isTwitter={isTwitter}
        />
      </div>
    </Card>
  )
}

export default CollectibleGallery
