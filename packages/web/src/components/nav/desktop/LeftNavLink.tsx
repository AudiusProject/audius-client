import { ComponentProps } from 'react'

import cn from 'classnames'
import { NavLink, NavLinkProps } from 'react-router-dom'
import { SetOptional } from 'type-fest'

import { Droppable, DroppableProps } from 'components/dragndrop'
import { selectDragnDropState } from 'store/dragndrop/slice'
import { useSelector } from 'utils/reducer'

import styles from './LeftNavLink.module.css'

type LeftNavItemProps =
  | { disabled?: boolean } & (
      | Omit<NavLinkProps, 'onDrop'>
      | Omit<ComponentProps<'div'>, 'onDrop'>
    )

export const LeftNavItem = (props: LeftNavItemProps) => {
  const { disabled, className: classNameProp, ...other } = props
  const className = cn(classNameProp, styles.link, {
    [styles.disabledLink]: disabled
  })
  if ('to' in other) {
    return <NavLink {...other} activeClassName='active' className={className} />
  }
  return <div {...other} className={className} />
}

type DroppableLeftNavItemProps = LeftNavItemProps &
  SetOptional<
    DroppableProps,
    'children' | 'hoverClassName' | 'activeClassName' | 'inactiveClassName'
  >

export const DroppableLeftNavItem = (props: DroppableLeftNavItemProps) => {
  const {
    acceptedKinds,
    acceptOwner,
    onDrop,
    stopPropagationOnDrop,
    disabled,
    ...leftNavItemProps
  } = props
  const { kind } = useSelector(selectDragnDropState)

  const hoverClassName =
    kind === 'track'
      ? styles.droppableLinkHoverTrack
      : styles.droppableLinkHoverPlaylist

  const activeClassName =
    kind === 'track' ? styles.droppableLinkActive : undefined

  return (
    <Droppable
      className={styles.droppableLink}
      hoverClassName={hoverClassName}
      activeClassName={activeClassName}
      inactiveClassName={styles.droppableLinkInactive}
      acceptedKinds={acceptedKinds}
      acceptOwner={acceptOwner}
      onDrop={onDrop}
      stopPropagationOnDrop={stopPropagationOnDrop}
      disabled={disabled}
    >
      <LeftNavItem {...leftNavItemProps} disabled={disabled} />
    </Droppable>
  )
}

type LeftNavDroppableProps = SetOptional<
  DroppableProps,
  'hoverClassName' | 'activeClassName' | 'inactiveClassName'
>

export const LeftNavDroppable = (props: LeftNavDroppableProps) => {
  const { kind } = useSelector(selectDragnDropState)

  const hoverClassName =
    kind === 'track'
      ? styles.droppableLinkHoverTrack
      : styles.droppableLinkHoverPlaylist

  const activeClassName =
    kind === 'track' ? styles.droppableLinkActive : undefined

  return (
    <Droppable
      className={styles.droppableLink}
      hoverClassName={hoverClassName}
      activeClassName={activeClassName}
      inactiveClassName={styles.droppableLinkInactive}
      {...props}
    />
  )
}
