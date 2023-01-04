import { ID } from '../../models'
import { CommonState } from '../commonStore'

export const getAllUserCollectibles = (state: CommonState) =>
  state.collectibles.userCollectibles

export const getUserCollectibles = (state: CommonState, props: { id: ID }) =>
  state.collectibles.userCollectibles[props.id]
