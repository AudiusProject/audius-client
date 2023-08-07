import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/* globals GA, GA_ACCESS_TOKEN, SITEMAP */

const DEBUG = false

const routes = [
  { pattern: /^\/([^/]+)$/, name: 'user', keys: ['handle'] },
  {
    pattern: /^\/([^/]+)\/([^/]+)$/,
    name: 'track',
    keys: ['handle', 'title']
  },
  {
    pattern: /^\/([^/]+)\/playlist\/([^/]+)$/,
    name: 'playlist',
    keys: ['handle', 'title']
  },
  {
    pattern: /^\/([^/]+)\/album\/([^/]+)$/,
    name: 'album',
    keys: ['handle', 'title']
  }
]

addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500
        })
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

function matchRoute(input) {
  for (const route of routes) {
    const match = route.pattern.exec(input)
    if (match) {
      const result = { name: route.name, params: {} }
      route.keys.forEach((key, index) => {
        result.params[key] = match[index + 1]
      })
      return result
    }
  }
  return null
}

function checkIsBot(val) {
  if (!val) {
    return false
  }
  const botTest =
    /altavista|baiduspider|bingbot|discordbot|duckduckbot|facebookexternalhit|gigabot|ia_archiver|linkbot|linkedinbot|msnbot|nextgensearchbot|reaper|slackbot|snap url preview service|telegrambot|twitterbot|whatsapp|whatsup|yahoo|yandex|yeti|yodaobot|zend|zoominfobot|embedly/i
  return botTest.test(val)
}

async function getMetadata(pathname) {
  const discoveryNode = 'https://discoveryprovider.audius.co'
  let discoveryRequestPath
  const route = matchRoute(pathname)
  switch (route.name) {
    case 'user': {
      const { handle } = route.params
      discoveryRequestPath = `v1/users/handle/${handle}`
      break
    }
    case 'track': {
      const { handle, title } = route.params
      discoveryRequestPath = `v1/tracks?handle=${handle}&slug=${title}`
      break
    }
    case 'playlist': {
      const { handle, title } = route.params
      discoveryRequestPath = `v1/full/playlists/by_permalink/${handle}/${title}`
      break
    }
    case 'album': {
      const { handle, title } = route.params
      discoveryRequestPath = `v1/full/playlists/by_permalink/${handle}/${title}`
      break
    }
    default:
      return null
  }
  try {
    const res = await fetch(`${discoveryNode}/${discoveryRequestPath}`)
    if (res.status !== 200) {
      throw new Error(res.status)
    }
    const json = res.json()
    return { metadata: json, name: route.name }
  } catch (e) {
    return null
  }
}

async function injectHead(asset, { title, description, image, permalink }) {
  const canonicalUrl = `https://audius.co/${permalink}`
  const tags = `
    <title>${title}</title>
    <meta name="description" content="${description}">

    <link rel="canonical" href="${canonicalUrl}">

    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${canonicalUrl}">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${canonicalUrl}">
`

  if (typeof asset === 'string' && asset.includes('</head>')) {
    asset = asset.replace('</head>', tags + '</head>')
  }

  return asset
}

async function handleEvent(event) {
  const url = new URL(event.request.url)
  const { pathname, search, hash } = url

  const isUndefined = pathname === '/undefined'
  if (isUndefined) {
    return Response.redirect(url.origin, 302)
  }

  const userAgent = event.request.headers.get('User-Agent') || ''

  const is204 = pathname === '/204'
  if (is204) {
    const response = new Response(undefined, { status: 204 })
    response.headers.set('access-control-allow-methods', '*')
    response.headers.set('access-control-allow-origin', '*')
    return response
  }

  const isBot = checkIsBot(userAgent)
  const isEmbed = pathname.startsWith('/embed')

  if (isBot || isEmbed) {
    const destinationURL = GA + pathname + search + hash
    const newRequest = new Request(destinationURL, event.request)
    newRequest.headers.set('host', GA)
    newRequest.headers.set('x-access-token', GA_ACCESS_TOKEN)

    return await fetch(newRequest)
  }

  const isSitemap = pathname.startsWith('/sitemaps')
  if (isSitemap) {
    const destinationURL = SITEMAP + pathname + search + hash
    const newRequest = new Request(destinationURL, event.request)
    return await fetch(newRequest)
  }

  const options = {}
  // Always map requests to `/`
  options.mapRequestToAsset = (request) => {
    const url = new URL(request.url)
    url.pathname = `/`
    return mapRequestToAsset(new Request(url, request))
  }

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true
      }
    }

    const asset = await getAssetFromKV(event, options)
    let modifiedAsset
    const { metadata, name } = await getMetadata(pathname)
    switch (name) {
      case 'user': {
        modifiedAsset = injectHead(asset, {
          title: `${metadata.data.name} (@${metadata.data.name})`,
          description: metadata.data.bio || '',
          image: metadata.data.profile_picture['1000x1000'] || '',
          permalink: metadata.data.handle
        })
        break
      }
      case 'track': {
        modifiedAsset = injectHead(asset, {
          title: `${metadata.data.title} by ${metadata.user.name}`,
          description: metadata.data.description || '',
          image: metadata.data.artwork['1000x1000'] || '',
          permalink: metadata.data.permalink
        })
        break
      }
      case 'playlist': {
        modifiedAsset = injectHead(asset, {
          title: `${metadata.data.playlist_name} by ${metadata.user.name}`,
          description: metadata.data.description || '',
          image: metadata.data.artwork['1000x1000'] || '',
          permalink: metadata.data.permalink
        })
        break
      }
      case 'album': {
        modifiedAsset = injectHead(asset, {
          title: `${metadata.data.playlist_name} by ${metadata.user.name}`,
          description: metadata.data.description || '',
          image: metadata.data.artwork['1000x1000'] || '',
          permalink: metadata.data.permalink
        })
        break
      }
      default:
        return null
    }
    return modifiedAsset
  } catch (e) {
    return new Response(e.message || e.toString(), { status: 500 })
  }
}
