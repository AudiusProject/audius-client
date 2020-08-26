import { matchPath } from 'react-router-dom'
import { USER_ID_PAGE, PROFILE_PAGE, staticRoutes } from 'utils/route'
import { decodeHashId } from './hashIds'

/**
 * Parses a user route into handle
 * @param route
 */
export const parseUserRoute = (route: string) => {
  if (staticRoutes.has(route)) return null

  const userIdPageMatch = matchPath<{ id: string }>(route, {
    path: USER_ID_PAGE,
    exact: true
  })
  if (userIdPageMatch) {
    const userId = decodeHashId(userIdPageMatch.params.id)
    if (!userId || isNaN(userId)) return null
    return { userId, handle: null }
  }

  const profilePageMatch = matchPath<{ handle: string }>(route, {
    path: PROFILE_PAGE,
    exact: true
  })
  if (profilePageMatch) {
    const { handle } = profilePageMatch.params
    return { handle, userId: null }
  }

  return null
}
