import { ComponentProps } from 'react'

import cn from 'classnames'
import { NavLink, NavLinkProps } from 'react-router-dom'
import { SetOptional } from 'type-fest'

import { Droppable, DroppableProps } from 'components/dragndrop'
import { selectDragnDropState } from 'store/dragndrop/slice'
import { useSelector } from 'utils/reducer'

import styles from './LeftNavLink.module.css'

type LeftNavLinkProps = NavLinkProps & {
  disabled?: boolean
}

export const LeftNavLink = (props: LeftNavLinkProps) => {
  const { disabled, children, className, ...other } = props
  return (
    <NavLink
      {...other}
      activeClassName='active'
      className={cn(className, styles.link, {
        [styles.disabledLink]: disabled
      })}
    >
      {children}
    </NavLink>
  )
}

type LeftNavButtonProps = ComponentProps<'button'> & {
  disabled?: boolean
}

export const LeftNavButton = (props: LeftNavButtonProps) => {
  const { className, disabled, ...other } = props
  return (
    <button
      className={cn(className, styles.link, {
        [styles.disabledLink]: disabled
      })}
      {...other}
    />
  )
}

type LeftNavItemProps =
  | { disabled?: boolean } & (
      | Omit<NavLinkProps, 'onDrop'>
      | Omit<ComponentProps<'button'>, 'onDrop'>
    )

export const LeftNavItem = (props: LeftNavItemProps) => {
  const { disabled, className: classNameProp, ...other } = props
  const className = cn(classNameProp, styles.link, {
    [styles.disabledLink]: disabled
  })
  if ('to' in other) {
    return <NavLink {...other} activeClassName='active' className={className} />
  }
  return <button {...other} className={className} />
}

type DroppableLeftNavLinkProps = Omit<LeftNavLinkProps, 'onDrop'> &
  Omit<
    DroppableProps,
    'children' | 'hoverClassName' | 'activeClassName' | 'inactiveClassName'
  >

export const DroppableLeftNavLink = (props: DroppableLeftNavLinkProps) => {
  const { acceptedKinds, acceptOwner, onDrop, ...leftNavLinkProps } = props
  return (
    <Droppable
      className={styles.droppableLink}
      hoverClassName={styles.droppableLinkHover}
      activeClassName={styles.droppableLinkActive}
      inactiveClassName={styles.droppableLinkInactive}
      acceptedKinds={acceptedKinds}
      acceptOwner={acceptOwner}
      onDrop={onDrop}
    >
      <LeftNavLink {...leftNavLinkProps} />
    </Droppable>
  )
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
