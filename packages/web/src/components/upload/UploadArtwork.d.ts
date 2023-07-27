export type UploadArtworkProps = {
  artworkUrl?: string
  onDropArtwork: (selectedFiles: File[], source: string) => Promise<void>
  onRemoveArtwork?: () => void
  error?: boolean
  imageProcessingError?: boolean
  onOpenPopup?: () => void
  onClosePopup?: () => void
  mount?: 'parent' | 'page' | 'body'
  defaultPopupOpen?: boolean
  isImageAutogenerated?: boolean
}

declare const UploadArtwork = (props: UploadArtworkProps) => JSX.Element

export default UploadArtwork