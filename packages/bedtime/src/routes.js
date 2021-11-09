const ROUTE_PREFIX = process.env.PREACT_APP_HOST_PREFIX

export const ID_ROUTE = `${ROUTE_PREFIX}/:type`
export const HASH_ID_ROUTE = `${ROUTE_PREFIX}/:type/:hashId`

export const COLLECTIBLES_ROUTE = `${ROUTE_PREFIX}/collectibles/:handle`
export const COLLECTIBLE_ID_ROUTE = `${ROUTE_PREFIX}/collectibles/:handle/:collectibleId`
