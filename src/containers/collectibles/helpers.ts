import { OpenSeaAsset, OpenSeaEvent } from 'services/opensea-client/types'
import {
  Collectible,
  CollectibleType
} from 'containers/collectibles/components/types'

const OPENSEA_AUDIO_EXTENSIONS = ['mp3', 'wav', 'oga']

const isAssetImage = (asset: OpenSeaAsset) => {
  return !!asset.image_url
}

const isAssetAudio = (asset: OpenSeaAsset) => {
  return OPENSEA_AUDIO_EXTENSIONS.some(extension =>
    asset.animation_url?.endsWith(extension)
  )
}

const isAssetVideo = (asset: OpenSeaAsset) => {
  return !!asset.animation_url && !isAssetAudio(asset)
}

export const isAssetImageOrVideo = (asset: OpenSeaAsset) => {
  return isAssetVideo(asset) || isAssetImage(asset)
}

export const assetToCollectible = (asset: OpenSeaAsset): Collectible => {
  return {
    id: asset.token_id,
    name: asset.name,
    description: asset.description,
    type: isAssetVideo(asset) ? CollectibleType.VIDEO : CollectibleType.IMAGE,
    imageUrl: asset.image_url,
    imagePreviewUrl: asset.image_preview_url,
    imageThumbnailUrl: asset.image_thumbnail_url,
    imageOriginalUrl: asset.image_original_url,
    animationUrl: asset.animation_url,
    animationOriginalUrl: asset.animation_original_url,
    youtubeUrl: asset.youtube_url,
    isOwned: true,
    dateCreated: null,
    dateLastTransferred: null,
    externalLink: asset.external_link
  }
}

export const creationEventToCollectible = (
  event: OpenSeaEvent
): Collectible => {
  const { asset, created_date } = event

  return {
    ...assetToCollectible(asset),
    dateCreated: created_date,
    isOwned: false
  }
}

export const transferEventToCollectible = (
  event: OpenSeaEvent
): Collectible => {
  const { asset, created_date } = event

  return {
    ...assetToCollectible(asset),
    dateLastTransferred: created_date
  }
}
