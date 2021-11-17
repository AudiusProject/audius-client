/* globals gifFrames */

export default () => {
  const script = '/scripts/gif-frames.js'
  // eslint-disable-next-line
  importWorkerScript(script)

  /**
   * Returns a jpeg of a gif
   * @param {string} key identifies this computation
   * @param {string} imageUrl url of the image to use
   */
  const gifPreview = ({ key, imageUrl }) => {
    gifFrames({
      url: imageUrl,
      frames: 0
    })
      .then(frameData => {
        if (!frameData.length) {
          console.error(imageUrl, 'frame data is empty')
          postMessage({ key, result: new Blob() })
        }
        postMessage({
          key,
          result: frameData[0].savedPixels._obj
        })
      })
      .catch(err => {
        console.error(imageUrl, err)
        // eslint-disable-next-line
        postMessage({ key, result: new Blob() })
      })
  }

  // eslint-disable-next-line
  self.addEventListener('message', e => {
    if (!e) return
    gifPreview(JSON.parse(e.data))
  })
}
