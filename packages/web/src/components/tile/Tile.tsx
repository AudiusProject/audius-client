import { ReactNode, ComponentType, ComponentProps, ElementType } from 'react'

import cn from 'classnames'

import { DogEar, DogEarType } from 'components/dog-ear'

import styles from './Tile.module.css'

type TileOwnProps<TileComponentType extends ElementType = 'div'> = {
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
  as?: TileComponentType
  dogEar?: DogEarType
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
    as: RootComponent = 'div',
    className,
    dogEar,
    ...other
  } = props

  const isDynamic = 'onClick' in other || 'href' in other

  return (
    <RootComponent
      className={cn(styles.root, size && styles[size], className, {
        [styles.dynamic]: isDynamic
      })}
      {...other}
    >
      {dogEar ? <DogEar type={dogEar} /> : null}
      {children}
    </RootComponent>
  )
}
