import React, { useEffect, useState } from 'react'

import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

export const OauthTesty = () => {
  const [handle, setHandle] = useState<string | null>(null)
  useEffect(() => {
    const renderButton = async () => {
      await waitForLibsInit()
      console.log(window.audiusLibs)
      const oauth = window.audiusLibs.oauth
      oauth.init('Demodius')
      window.audiusLibs.oauth.renderButton(
        document.getElementById('testy'),
        (res: {
          userId: number
          email: string
          name: string
          handle: string
          verified: boolean
          imageURL?: string
          sub: number
          iat: string
        }) => setHandle(res.handle),
        (err: unknown) => console.log('error', err),
        {
          size: 'large',
          corners: 'pill',
          customText: 'Login with Audius'
        }
      )
    }
    renderButton()
  }, [])

  return (
    <div>
      {handle ? (
        <>You&apos;re logged in as {handle!}</>
      ) : (
        <div>
          <div id='testy'></div>
        </div>
      )}
    </div>
  )
}
