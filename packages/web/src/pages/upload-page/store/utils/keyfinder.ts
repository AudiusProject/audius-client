import keyFinderWorkerURL from 'workers/keyFinderProgressiveWorker.worker'

const initializeKeyFinder = ({
  sampleRate,
  numberOfChannels
}: {
  sampleRate: number
  numberOfChannels: number
}) => {
  const worker = new Worker(keyFinderWorkerURL)
  worker.postMessage({
    funcName: 'initialize',
    data: [sampleRate, numberOfChannels]
  })
  return worker
}

const handleAudioFile = (buffer: AudioBuffer) => {
  const sampleRate = buffer.sampleRate
  const numberOfChannels = buffer.numberOfChannels
  const channelData = []
  for (let i = 0; i < numberOfChannels; i += 1) {
    channelData.push(buffer.getChannelData(i))
  }
  initializeKeyFinder({ sampleRate, numberOfChannels })
}

const handleFileLoad = async (
  event: ProgressEvent<FileReader>
): Promise<void> => {
  const context = new AudioContext()
  context.decodeAudioData(event.target?.result as ArrayBuffer, handleAudioFile)
}

export const getKeyAndBpm = (file: File) => {
  const fileReader = new FileReader()
  fileReader.addEventListener('load', handleFileLoad)
  return { key: 'foo' }
}
