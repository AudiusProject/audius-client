import WebWorker from 'services/WebWorker'
import resizeImageWorkerFile from 'workers/resizeImage.worker.js'
import averageRgbWorkerFile from 'workers/averageRgb.worker.js'

const averageRgbWorker = new WebWorker(averageRgbWorkerFile, false)

const ALLOWED_IMAGE_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/tiff',
  'image/gif',
  'image/webp'
]

export const resizeImage = async (
  imageFile,
  maxWidth = 1000,
  square = true
) => {
  if (!ALLOWED_IMAGE_FILE_TYPES.includes(imageFile.type)) {
    throw new Error('invalid file type')
  }
  const imageUrlBlob = URL.createObjectURL(imageFile)
  const worker = new WebWorker(resizeImageWorkerFile)
  worker.call({ imageUrl: imageUrlBlob, maxWidth, square })
  return worker.getResult()
}

export const averageRgb = async (imageUrl, chunkSize = 100) => {
  averageRgbWorker.call({ imageUrl, chunkSize }, imageUrl)
  return averageRgbWorker.getResult(imageUrl)
}
