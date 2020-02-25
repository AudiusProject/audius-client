/* globals Jimp */

export default () => {
  const DEFAULT_RGB = `rgb(13,16,18)`
  const DEFAULT_IMAGE = 'https://download.audius.co/static-resources/preview-image.jpg'
  const SAMPLE_RATE = 20

  // Based off this site: https://app.contrast-finder.org/result.html?foreground=%23FFFFFF&background=%23cdc8c8&ratio=4.5&isBackgroundTested=true&algo=Rgb
  // the brightest color we want to support, given white text, is
  // #CDC8C8, which works out to a luminance of 201.
  const LUMINANCE_THRESHOLD = 201


  const clampedRGBColor = (rgbString /* string of 'r,g,b' */) => {
    const [r, g, b] = rgbString.split(',').map(x => parseInt(x))
  // Luminance in [0, 255]
  // https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b)

    if (luminance < LUMINANCE_THRESHOLD) {
      return [r, g, b]
    }

    const scaleFactor = LUMINANCE_THRESHOLD / luminance
    return [r, g, b].map(x => x * scaleFactor)
  }

  const formatRGB = (r, g, b) => `rgb(${r},${g},${b})`

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
        img.posterize(15)
        const imageData = img.bitmap;
        const pixels = imageData.data;
        const pixelCount = imageData.width * imageData.height;

        let counts = {}

        for (let i = 0; i < pixelCount; i += SAMPLE_RATE) {
          const offset = i * 4

          const r = pixels[offset]
          const g = pixels[offset + 1]
          const b = pixels[offset + 2]
          const rgb = `${r},${g},${b}`
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

        result = clampedRGBColor(result)
        result = formatRGB(...result)

        // eslint-disable-next-line
        postMessage({key, result})
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

