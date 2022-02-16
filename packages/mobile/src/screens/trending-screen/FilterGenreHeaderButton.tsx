import { makeStyles } from 'app/styles'

import { Button } from '../profile-screen/Button'

const useStyles = makeStyles(({ spacing, palette }) => ({
  headerButton: {
    height: 24,
    paddingHorizontal: spacing(3),
    minWidth: 88,
    borderRadius: 6,
    backgroundColor: palette.secondary
  },
  headerButtonText: {
    fontSize: 14,
    textTransform: 'none'
  }
}))
export const FilterGenreHeaderButton = () => {
  const styles = useStyles()
  return (
    <Button
      variant='primary'
      title='All Genres'
      onPress={() => {}}
      styles={{ root: styles.headerButton, text: styles.headerButtonText }}
    />
  )
}
