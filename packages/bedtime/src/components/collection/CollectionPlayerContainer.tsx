import { h } from 'preact'

import { GetCollectionsResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'

interface CollectionPlayerContainerProps {
  flavor: PlayerFlavor
  collection: GetCollectionsResponse
}

const CollectionPlayerContainer = (props: CollectionPlayerContainerProps) => {
  return (<div>'This is the collection player container'</div>)
}

export default CollectionPlayerContainer