/* globals Jimp */

export default () => {
  const DEFAULT_RGB = { r: 13, g: 16, b: 18 }

  const script = '/assets/scripts/jimp.min.js'
  // eslint-disable-next-line
  importWorkerScript(script)

  /**
   * Returns the dominant RGB color of an image.
   * @param {string} key identifies this computation
   * @param {string} imageUrl url of the image to use
   */
  const dominantRgb = ({ key, imageUrl }) => {
    const counts = {}

    Jimp.read(imageUrl)
      .then(img => {
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
          const r = img.bitmap.data[idx]
          const g = img.bitmap.data[idx + 1]
          const b = img.bitmap.data[idx + 2]
          const rgb = `rgb(${r},${g},${b})`
          if (rgb in counts) {
            counts[rgb] += 1
          } else {
            counts[rgb] = 1
          }
        })
        let result
        Object.keys(counts).reduce((acc, i) => {
          if (counts[i] > acc) {
            result = i
            return counts[i]
          }
        }, 0)

        // eslint-disable-next-line
        postMessage({key, result})
      })
      .catch(err => {
        console.error(imageUrl, err)
        // eslint-disable-next-line
        postMessage({key, result: DEFAULT_RGB})
      })
  }

  // eslint-disable-next-line
  self.addEventListener('message', e => {
    if (!e) return
    dominantRgb(JSON.parse(e.data))
  })
}

