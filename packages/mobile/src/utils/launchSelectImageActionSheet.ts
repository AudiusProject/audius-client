import type { Image } from '@audius/common'
import { ActionSheetIOS, Alert, Platform } from 'react-native'
import type {
  Image as CropPickerImage,
  Options
} from 'react-native-image-crop-picker'
import { openPicker, openCamera } from 'react-native-image-crop-picker'

import { store } from 'app/store'

import { selectSystemTheme } from './theme'

export const launchSelectImageActionSheet = (
  onSelectImage: (image: Image) => void,
  options: Options
) => {
  const theme = selectSystemTheme(store.getState())
  const { primary, secondary } = theme

  const pickerThemeOptions: Options = {
    cropperActiveWidgetColor: secondary,
    cropperStatusBarColor: secondary,
    cropperToolbarColor: secondary,
    cropperChooseColor: primary,
    cropperCancelColor: secondary
  }

  const handleSelectImage = (image: CropPickerImage) => {
    const { path, filename, mime } = image
    return onSelectImage({
      url: path,
      file: { uri: path, name: filename ?? '', type: mime }
    })
  }

  const selectPhotoFromLibrary = () => {
    openPicker({
      ...options,
      ...pickerThemeOptions,
      cropping: true,
      mediaType: 'photo'
    }).then(handleSelectImage)
  }

  const takePhoto = () => {
    openCamera({
      ...options,
      ...pickerThemeOptions,
      cropping: true,
      mediaType: 'photo'
    }).then(handleSelectImage)
  }

  if (Platform.OS === 'ios') {
    // iOS ActionSheet
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Photo Library', 'Take Photo'],
        tintColor: theme.secondary,
        cancelButtonIndex: 0
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          selectPhotoFromLibrary()
        } else if (buttonIndex === 2) {
          takePhoto()
        }
      }
    )
  } else {
    // Android Alert
    Alert.alert(
      'Select Photo',
      '',
      [
        {
          text: 'Photo Library',
          style: 'default',
          onPress: selectPhotoFromLibrary
        },
        {
          text: 'Take Photo',
          style: 'default',
          onPress: takePhoto
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ],
      {
        cancelable: true,
        onDismiss: () => null
      }
    )
  }
}
