export type CollectiblesMetadata = {
  [key: string]: object
  order: string[]
}

export enum CollectibleType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export type Collectible = {
  id: string
  name: string | null
  description: string | null
  type: CollectibleType
  imageUrl: string | null
  imagePreviewUrl: string | null
  imageThumbnailUrl: string | null
  imageOriginalUrl: string | null
  animationUrl: string | null
  animationOriginalUrl: string | null
  youtubeUrl: string | null
  isOwned: boolean
  dateCreated: string | null
  dateLastTransferred: string | null
  externalLink: string | null
}
