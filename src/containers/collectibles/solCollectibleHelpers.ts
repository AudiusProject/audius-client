import {
  Collectible,
  CollectibleMediaType
} from 'containers/collectibles/types'
import {
  SolanaNFT,
  SolanaNFTPropertiesFile
} from 'services/solana-client/types'
import { Chain } from 'store/token-dashboard/slice'
import { Nullable } from 'utils/typeUtils'

import { getFrameFromGif } from './ethCollectibleHelpers'

type SolanaNFTMedia = {
  collectibleMediaType: CollectibleMediaType
  url: string
  frameUrl: Nullable<string>
}

const nftGif = async (nft: SolanaNFT): Promise<Nullable<SolanaNFTMedia>> => {
  const gifFile = nft.properties.files?.find(
    file => typeof file === 'object' && file.type === 'image/gif'
  )
  if (gifFile) {
    const url = (gifFile as SolanaNFTPropertiesFile).uri
    const frameUrl = await getFrameFromGif(url, nft.name)
    return { collectibleMediaType: CollectibleMediaType.GIF, url, frameUrl }
  }
  return null
}

const nftVideo = async (nft: SolanaNFT): Promise<Nullable<SolanaNFTMedia>> => {
  const files = nft.properties.files
  // should we restrict video file extensions here?
  // MP4, MOV, GLB
  // GLTF??
  // https://github.com/metaplex-foundation/metaplex/blob/81023eb3e52c31b605e1dcf2eb1e7425153600cd/js/packages/web/src/views/artCreate/index.tsx#L318
  // DO WE CARE ABOUT VR NFTs??
  const videoFile = files?.find(
    file => typeof file === 'object' && file.type.includes('video')
  ) as SolanaNFTPropertiesFile
  // https://github.com/metaplex-foundation/metaplex/blob/397ceff70b3524aa0543540584c7200c79b198a0/js/packages/web/src/components/ArtContent/index.tsx#L107
  const videoUrl = files?.find(
    file =>
      typeof file === 'string' &&
      file.startsWith('https://watch.videodelivery.net/')
  ) as string
  const isVideo =
    nft.properties.category === 'video' ||
    nft.animation_url ||
    videoFile ||
    videoUrl
  if (isVideo) {
    let url: string, videoType
    if (nft.animation_url) {
      url = nft.animation_url
    } else if (videoFile) {
      url = videoFile.uri
      videoType = videoFile.type
    } else if (videoUrl) {
      url = videoUrl // maybe videoUrl.replace('watch', 'iframe')?
    } else if (files?.length) {
      if (files.length === 1) {
        url = typeof files[0] === 'object' ? files[0].uri : files[0]
      } else {
        url = typeof files[1] === 'object' ? files[1].uri : files[1]
      }
      // videoType = defaultVideoType
    } else {
      return null
    }
    return {
      collectibleMediaType: CollectibleMediaType.VIDEO,
      url,
      frameUrl: nft.image || null
    }
  }
  return null
}

const nftImage = async (nft: SolanaNFT): Promise<Nullable<SolanaNFTMedia>> => {
  const files = nft.properties.files
  // should we restrict image file extensions here?
  // PNG, JPG, GIF
  // https://github.com/metaplex-foundation/metaplex/blob/81023eb3e52c31b605e1dcf2eb1e7425153600cd/js/packages/web/src/views/artCreate/index.tsx#L316
  const imageFile = files?.find(
    file => typeof file === 'object' && file.type.includes('image')
  ) as SolanaNFTPropertiesFile
  const isImage =
    nft.properties.category === 'image' || nft.image.length || imageFile
  if (isImage) {
    let url
    if (nft.image.length) {
      url = nft.image
    } else if (imageFile) {
      url = imageFile.uri
    } else if (files?.length) {
      if (files.length === 1) {
        url = typeof files[0] === 'object' ? files[0].uri : files[0]
      } else {
        url = typeof files[1] === 'object' ? files[1].uri : files[1]
      }
    } else {
      return null
    }
    return {
      collectibleMediaType: CollectibleMediaType.IMAGE,
      url,
      frameUrl: url
    }
  }
  return null
}

const nftComputedMedia = async (
  nft: SolanaNFT
): Promise<Nullable<SolanaNFTMedia>> => {
  const files = nft.properties.files
  if (!files?.length) {
    return null
  }
  const url = typeof files[0] === 'object' ? files[0].uri : files[0]
  // get mime type
  // make sure it's gif/video/image
  const headResponse = await fetch(url, { method: 'HEAD' })
  const contentType = headResponse.headers.get('Content-Type')
  const isGif = contentType?.includes('gif')
  const isVideo = contentType?.includes('video')
  if (isGif) {
    const frameUrl = await getFrameFromGif(url, nft.name)
    return { collectibleMediaType: CollectibleMediaType.GIF, url, frameUrl }
  }
  if (isVideo) {
    return {
      collectibleMediaType: CollectibleMediaType.VIDEO,
      url,
      frameUrl: null
    }
  }
  return {
    collectibleMediaType: CollectibleMediaType.IMAGE,
    url,
    frameUrl: url
  }
}

export const solanaNFTToCollectible = async (
  nft: SolanaNFT,
  address: string
): Promise<Collectible> => {
  const identifier = [
    nft.symbol,
    nft.name,
    nft.image /* this would not always be image e.g. could be video or gif?? */
  ]
    .filter(Boolean)
    .join(':::')

  const collectible = {
    id: identifier,
    tokenId: identifier,
    name: nft.name,
    description: nft.description,
    externalLink: nft.external_url,
    isOwned: true,
    chain: Chain.Sol
  } as Collectible

  if (nft.properties.creators.some(creator => creator.address === address)) {
    collectible.isOwned = false
  }

  const { url, frameUrl, collectibleMediaType } = ((await nftGif(nft)) ||
    (await nftVideo(nft)) ||
    (await nftImage(nft)) ||
    (await nftComputedMedia(nft))) as SolanaNFTMedia
  collectible.frameUrl = frameUrl
  collectible.mediaType = collectibleMediaType
  if (collectibleMediaType === CollectibleMediaType.GIF) {
    collectible.gifUrl = url
  } else if (collectibleMediaType === CollectibleMediaType.VIDEO) {
    collectible.videoUrl = url
  } else if (collectibleMediaType === CollectibleMediaType.IMAGE) {
    collectible.imageUrl = url
  }

  return collectible
}
