import { self } from 'react-native-threads'

const Jimp = require('./jimp.min.js')

const DEFAULT_RGB = '#7e1bcc'
const SAMPLE_RATE = 20
const NUM_DOMINANT_COLORS = 3
// Based off this site: https://app.contrast-finder.org/result.html?foreground=%23FFFFFF&background=%23cdc8c8&ratio=4.5&isBackgroundTested=true&algo=Rgb
// the brightest color we want to support, given white text, is
// #CDC8C8, which works out to a luminance of 201.
const LUMINANCE_THRESHOLD = 201

const clampedRGBColor = (rgbString /* string of 'r,g,b' */) => {
  const rgb = rgbString.split(',').map((x) => parseInt(x, 10))
  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]

  // Luminance in [0, 255]
  // https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  if (luminance < LUMINANCE_THRESHOLD) {
    return [r, g, b]
  }

  const scaleFactor = LUMINANCE_THRESHOLD / luminance
  return [r, g, b].map((x) => x * scaleFactor)
}

const calculateEuclideanDistance = (c1, c2) => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
  )
}

const findIndexOfMaxEuclideanDistance = (existing, selectFrom) => {
  if (existing.length === 0 || selectFrom.length === 0) {
    throw new Error('Invalid number of colors to pick from')
  }

  let maxDistance = Number.NEGATIVE_INFINITY
  let indexOfMaxDistance = -1
  for (let i = 0; i < selectFrom.length; i++) {
    let curDistance = 0
    for (let j = 0; j < existing.length; j++) {
      curDistance += calculateEuclideanDistance(existing[j], selectFrom[i])
    }
    if (curDistance > maxDistance) {
      indexOfMaxDistance = i
      maxDistance = curDistance
    }
  }
  return indexOfMaxDistance
}

const calculateColorfulness = (color) => {
  // Reference: https://stackoverflow.com/questions/61705774/mathematically-calculate-vibrancy-of-a-color
  const max = Math.max(color.r, color.g, color.b)
  const min = Math.min(color.r, color.g, color.b)
  return ((max + min) * (max - min)) / max
}

/**  Picks the two most dominant colors that meet a min threshold of colorfulness. */
export const pickTwoMostDominantAndColorful = (colors) => {
  const filtered = colors.filter((c) => {
    return calculateColorfulness(c) >= 50.0
  })
  if (filtered.length < 2) {
    return colors
      .sort((a, b) => {
        return calculateColorfulness(b) - calculateColorfulness(a)
      })
      .slice(0, 2)
  }
  return filtered
}

const findDominantColors = (selectFrom) => {
  const domColors = [selectFrom.shift()]

  while (domColors.length < NUM_DOMINANT_COLORS && selectFrom.length > 0) {
    const indexOfNextDomColor = findIndexOfMaxEuclideanDistance(
      domColors,
      selectFrom
    )
    domColors.push(selectFrom[indexOfNextDomColor])
    selectFrom.splice(indexOfNextDomColor, 1)
  }
  return domColors
}

/**
 * Returns the 3 dominant RGB colors of an image.
 * @param {string} imageUrl url of the image to use
 */
export const getDominantRgb = (imageUrl) => {
  return Jimp.read(imageUrl)
    .then((img) => {
      img.posterize(15)
      const imageData = img.bitmap
      const pixels = imageData.data
      const pixelCount = imageData.width * imageData.height

      const counts = {}

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

      const sortedResult = Object.keys(counts)
        .sort((a, b) => {
          return counts[b] - counts[a]
        })
        .map((c) => ({
          r: clampedRGBColor(c)[0],
          g: clampedRGBColor(c)[1],
          b: clampedRGBColor(c)[2]
        }))

      let result
      if (sortedResult.length <= NUM_DOMINANT_COLORS) {
        result = sortedResult
      } else {
        result = findDominantColors(sortedResult)
      }
      return result
    })
    .catch((err) => {
      console.error(imageUrl, err)
      return DEFAULT_RGB
    })
}

export const dominantRgb = (imageUrl) => {
  getDominantRgb(imageUrl).then((result) => {
    self.postMessage(JSON.stringify(result))
  })
}

// listen for messages
self.onmessage = (imageUrl) => {
  dominantRgb(imageUrl)
}
