import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import { ReactComponent as IconCreatePlaylist } from 'assets/img/iconCreatePlaylist.svg'
import styles from './CreatePlaylistButton.module.css'

const CreatePlaylistButton = props => {
  return (
    <button
      className={cn(props.className, styles.createPlaylistButton)}
      onClick={props.onClick}
    >
      <IconCreatePlaylist />
      <div>Create Playlist</div>
    </button>
  )
}

CreatePlaylistButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func
}

export default CreatePlaylistButton
