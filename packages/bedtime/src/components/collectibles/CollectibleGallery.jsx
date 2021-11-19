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
  const [hasFetched, setHasFetched] = useState(false)

  const fetchCollectiblesOrder = async () => {
    const result = await fetchJsonFromCID(user.metadata_multihash)
    setHasFetched(true)

    if (result && result.collectibles) {
      const collectiblesMetadataKeySet = new Set(Object.keys(result.collectibles))
      const newCollectiblesMap = collectibles
        .map(c => c.id)
        .filter(id => !collectiblesMetadataKeySet.has(id))
        .reduce((acc, curr) => ({ ...acc, [curr]: {} }), {})

      setOrder(result.collectibles.order.concat(Object.keys(newCollectiblesMap)))
    }
  }

  useEffect(() => { fetchCollectiblesOrder() }, [])
  if (!hasFetched) return null

  let collectiblesArray = collectibles

  if (order) {
    const orderedArray = order
      .map(collectibleId => collectibles.find(c => c.id === collectibleId))
      .filter(c => c !== undefined)

    if (orderedArray.length) collectiblesArray = orderedArray
  }

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
            <CollectibleTile
              key={collectible.id}
              collectible={collectible}
              onClick={() => {
                setModalCollectible(collectible)
                setIsModalOpen(true)
              }}
            />
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
