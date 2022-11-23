import detect from 'bpm-detective'

import WebWorker from 'services/WebWorker'

const initializeKeyFinder = async ({
  sampleRate,
  numberOfChannels
}: {
  sampleRate: number
  numberOfChannels: number
}) => {
  const keyFinderWorkerSource = await import(
    'workers/keyFinderProgressiveWorker.worker.js'
  )
  const webWorker = new WebWorker(keyFinderWorkerSource.default, false)
  webWorker.worker?.postMessage({
    funcName: 'initialize',
    data: [sampleRate, numberOfChannels]
  })
  return webWorker
}

function extractResultFromByteArray(byteArray: Uint8Array) {
  return byteArray.reduce((acc, cur) => `${acc}${String.fromCharCode(cur)}`, '')
}

function zipChannelsAtOffset(
  channelData: Float32Array[],
  offset: number,
  sampleRate: number,
  numberOfChannels: number
) {
  const segment = new Float32Array(sampleRate * numberOfChannels)
  for (let i = 0; i < sampleRate; i += 1) {
    for (let j = 0; j < numberOfChannels; j += 1) {
      segment[i + j] = channelData[j][offset + i]
    }
  }
  return segment
}

const postAudioSegmentAtOffset = (
  worker: Worker,
  channelData: Float32Array[],
  sampleRate: number,
  numberOfChannels: number,
  offset: number
) => {
  const segment = zipChannelsAtOffset(
    channelData,
    offset,
    sampleRate,
    numberOfChannels
  )
  worker.postMessage({ funcName: 'feedAudioData', data: [segment] })
}

const detectBufferKey = async (buffer: AudioBuffer) => {
  const sampleRate = buffer.sampleRate
  const numberOfChannels = buffer.numberOfChannels
  const channelData: Float32Array[] = []
  for (let i = 0; i < numberOfChannels; i += 1) {
    channelData.push(buffer.getChannelData(i))
  }
  const webWorker = await initializeKeyFinder({ sampleRate, numberOfChannels })
  const segmentCounts = Math.floor(channelData[0].length / sampleRate)
  let currentSegment = 0
  return new Promise<string>((resolve, reject) => {
    if (webWorker.worker === undefined) {
      throw new Error('worker failed to initialize')
    }
    webWorker.worker.addEventListener('message', (event: MessageEvent) => {
      if (webWorker.worker === undefined) {
        throw new Error('WebWorker worker not set')
      }
      if (event.data.finalResponse) {
        const result = extractResultFromByteArray(event.data.data)
        webWorker.worker.terminate()
        resolve(result)
      } else {
        // Not final response
        if (event.data.data === 0) {
          // very first response
          postAudioSegmentAtOffset(
            webWorker.worker!,
            channelData,
            sampleRate,
            numberOfChannels,
            0
          )
          currentSegment++
        } else {
          if (currentSegment < segmentCounts) {
            const offset = currentSegment * sampleRate
            postAudioSegmentAtOffset(
              webWorker.worker,
              channelData,
              sampleRate,
              numberOfChannels,
              offset
            )
            currentSegment++
          } else {
            // no more segments
            webWorker.worker.postMessage({ funcName: 'finalDetection' })
          }
        }
      }
    })
  })
}

const readFile = async (file: File, callback: Function) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.addEventListener('load', (event) => {
      const context = new AudioContext()
      context.decodeAudioData(event.target?.result as ArrayBuffer, (buffer) => {
        resolve(callback(buffer))
      })
    })
    fileReader.readAsArrayBuffer(file)
  })
}

export const MAJOR_KEYS = [
  'B Major',
  'Gb Major',
  'Db Major',
  'Ab Major',
  'Eb Major',
  'Bb Major',
  'F Major',
  'C Major',
  'G Major',
  'D Major',
  'A Major',
  'E Major'
]
export const MINOR_KEYS = [
  'Ab Minor',
  'Eb Minor',
  'Bb Minor',
  'F Minor',
  'C Minor',
  'G Minor',
  'D Minor',
  'A Minor',
  'E Minor',
  'B Minor',
  'Gb Minor',
  'Db Minor'
]
export const getHarmonicKeys = (key: string | undefined) => {
  console.log(key)
  if (!key) {
    return []
  }
  if (key.split(' ')[1] === 'Major') {
    const index = MAJOR_KEYS.findIndex((k) => k === key)
    return [
      MINOR_KEYS[index],
      MAJOR_KEYS[(index + 11) % 12],
      MAJOR_KEYS[(index + 1) % 12]
    ]
  } else {
    const index = MINOR_KEYS.findIndex((k) => k === key)
    return [
      MAJOR_KEYS[index],
      MINOR_KEYS[(index + 11) % 12],
      MINOR_KEYS[(index + 1) % 12]
    ]
  }
}

export const detectKey = async (file: File) => {
  return readFile(file, detectBufferKey)
}

export const detectBpm = async (file: File) => {
  return readFile(file, detect)
}
