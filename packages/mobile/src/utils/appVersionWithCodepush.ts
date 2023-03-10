import codePush from 'react-native-code-push'

let versionInfo: string | null = null
codePush
  .getUpdateMetadata()
  .then((update) => {
    if (update) {
      versionInfo = `${update.appVersion}+codepush:${update.label}`
    }
  })
  .catch((e) => {
    console.error('Error getting CodePush metadata.', e)
  })

export { versionInfo }
