import codePush from 'react-native-code-push'
import VersionNumber from 'react-native-version-number'

let versionInfo: string | null = null
codePush
  .getUpdateMetadata()
  .then((update) => {
    if (update) {
      versionInfo = `${VersionNumber.appVersion}+codepush:${update.label}`
    } else {
      versionInfo = VersionNumber.appVersion
    }
  })
  .catch((e) => {
    console.error('Error getting CodePush metadata.', e)
  })

export { versionInfo }
