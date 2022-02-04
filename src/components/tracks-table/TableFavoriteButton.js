import React, { Component } from 'react'

import cn from 'classnames'
import PropTypes from 'prop-types'

import FavoriteButton from 'components/alt-button/FavoriteButton'

import styles from './TableFavoriteButton.module.css'

class TableFavoriteButton extends Component {
  render() {
    const { favorited, onClick, className } = this.props

    return (
      <div
        onClick={onClick}
        className={cn(
          styles.tableFavoriteButton,
          className,
          'tableFavoriteButton',
          { [styles.notFavorited]: !favorited }
        )}
      >
        <FavoriteButton
          isActive={favorited}
          className={styles.icon}
          onClick={onClick}
        />
      </div>
    )
  }
}

TableFavoriteButton.propTypes = {
  favorited: PropTypes.bool,
  onClick: PropTypes.func
}

TableFavoriteButton.defaultProps = {
  favorited: false
}

export default TableFavoriteButton
