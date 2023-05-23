import { TextField } from '../edit-track-screen/fields'

const messages = {
  label: 'Name',
  placeholder: 'My Playlist'
}

export const PlaylistNameInput = () => {
  return (
    <TextField
      required
      name='playlist_name'
      label={messages.label}
      placeholder={messages.placeholder}
    />
  )
}
