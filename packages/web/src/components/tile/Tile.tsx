import { ReactNode, ComponentType, ComponentProps, ElementType } from 'react'

import { DogEarType } from '@audius/common'
import cn from 'classnames'

import { DogEar } from 'components/dog-ear'

import styles from './Tile.module.css'

type TileOwnProps<TileComponentType extends ElementType = 'div'> = {
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
  as?: TileComponentType
  dogEar?: DogEarType
  elevation?: 'flat' | 'near' | 'mid' | 'far'
}

export type TileProps<TileComponentType extends ElementType> =
  TileOwnProps<TileComponentType> &
    Omit<ComponentProps<TileComponentType>, keyof TileOwnProps>

export const Tile = <
  T extends ElementType = ComponentType<ComponentProps<'div'>>
>(
  props: TileProps<T>
) => {
  const {
    children,
    size,
    onClick,
    as: RootComponent = onClick ? 'button' : 'div',
    className,
    dogEar,
    elevation = 'near',
    ...other
  } = props

  return (
    <RootComponent
      className={cn(
        styles.root,
        size && styles[size],
        styles[elevation],
        className
      )}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      {...other}
    >
      {dogEar ? (
        <div className={styles.borderOffset}>
          <DogEar type={dogEar} />
        </div>
      ) : null}
      {children}
    </RootComponent>
  )
}
