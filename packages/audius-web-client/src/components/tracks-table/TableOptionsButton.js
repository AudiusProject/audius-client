import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import Menu from 'containers/menu/Menu'
import { ReactComponent as IconOptions } from 'assets/img/iconKebabHorizontal.svg'

import stylesTab from 'components/actions-tab/ActionsTab.module.css'
import styles from './TableOptionsButton.module.css'

class TableOptionsButton extends Component {
  render() {
    const {
      onClick,
      className,
      trackId,
      index,
      uid,
      date,
      isOwner,
      isArtistPick,
      onRemove,
      removeText,
      hiddenUntilHover
    } = this.props

    const removeMenuItem = {
      text: removeText,
      onClick: () => onRemove(trackId, index, uid, date.unix())
    }

    const overflowMenu = {
      menu: {
        type: 'track',
        mount: 'page',
        includeShare: true,
        isOwner,
        isArtistPick,
        ...this.props,
        extraMenuItems: onRemove ? [removeMenuItem] : []
      }
    }

    return (
      <div
        onClick={onClick}
        className={cn(
          styles.tableOptionsButton,
          className,
          'tableOptionsButton'
        )}
      >
        <div>
          <Menu {...overflowMenu}>
            <div className={stylesTab.iconKebabHorizontalWrapper}>
              <IconOptions
                className={cn(stylesTab.iconKebabHorizontal, styles.icon, {
                  [styles.iconHidden]: hiddenUntilHover
                })}
              />
            </div>
          </Menu>
        </div>
      </div>
    )
  }
}

TableOptionsButton.propTypes = {
  className: PropTypes.string,
  handle: PropTypes.string,
  trackId: PropTypes.number,
  index: PropTypes.number,
  isSaved: PropTypes.bool,
  isDeleted: PropTypes.bool,
  trackTitle: PropTypes.string,
  albumId: PropTypes.number,
  albumName: PropTypes.string,
  date: PropTypes.object,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  removeText: PropTypes.string,
  isArtistPick: PropTypes.bool,
  isOwner: PropTypes.bool,
  hiddenUntilHover: PropTypes.bool
}

TableOptionsButton.defaultProps = {
  onRemove: null,
  remoteText: '',
  hiddenUntilHover: true
}

export default TableOptionsButton
