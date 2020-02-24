/* globals Jimp */

export default () => {
  const DEFAULT_RGB = `rgb(13,16,18)`
  const DEFAULT_IMAGE = 'https://download.audius.co/static-resources/preview-image.jpg'
  const SAMPLE_RATE = 20

  // TODO: don't hardcode `embed into this - only`
  const script = `${process.env.PREACT_APP_SCRIPT_DIRECTORY}/jimp.min.js`
  // eslint-disable-next-line
  importWorkerScript(script)

  let tries = 0

  /**
   * Returns the dominant RGB color of an image.
   * @param {string} key identifies this computation
   * @param {string} imageUrl url of the image to use
   */
  const dominantRgb = ({ key, imageUrl }) => {
    Jimp.read(imageUrl)
      .then(img => {
        console.time('start')
        img.posterize(15)
        // without quantize: 16ms
        const imageData = img.bitmap;
        const pixels = imageData.data;
        const pixelCount = imageData.width * imageData.height;

        let counts = {}

        for (let i = 0; i < pixelCount; i += SAMPLE_RATE) {
          const offset = i * 4

          const r = pixels[offset]
          const g = pixels[offset + 1]
          const b = pixels[offset + 2]
          const rgb = `rgb(${r},${g},${b})`
          if (rgb in counts) {
            counts[rgb] += 1
          } else {
            counts[rgb] = 1
          }
        }


        let result
        Object.keys(counts).reduce((acc, i) => {
          if (counts[i] > acc) {
            result = i
            return counts[i]
          }
        }, 0)

        // eslint-disable-next-line
        postMessage({key, result})
        console.timeEnd('start')
      })
      .catch(err => {
        if (tries > 2) {
          postMessage({key, result: DEFAULT_RGB})
          return
        }
        tries += 1
        console.error(imageUrl, err)
        dominantRgb({
          key,
          imageUrl: DEFAULT_IMAGE
        })
        // eslint-disable-next-line
      })
  }

  // eslint-disable-next-line
  self.addEventListener('message', e => {
    if (!e) return
    dominantRgb(JSON.parse(e.data))
  })
}

