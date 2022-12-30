import { useCallback, MouseEvent } from 'react'

import { TikTokProfile } from '@audius/common'

import {
  TikTokButton,
  TikTokButtonProps
} from 'components/social-button/tiktok-button/TikTokButton'
import { useTikTokAuth } from 'hooks/useTikTokAuth'

type TikTokAuthButtonProps = {
  onFailure: (e: Error) => void
  onSuccess: (uuid: string, profile: TikTokProfile) => void
} & TikTokButtonProps

export const TikTokAuthButton = (props: TikTokAuthButtonProps) => {
  const { onFailure, onSuccess, onClick, ...buttonProps } = props

  const withTikTokAuth = useTikTokAuth({
    onError: onFailure
  })

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      withTikTokAuth(async (accessToken: string) => {
        try {
          // Using TikTok v1 api because v2 does not have CORS headers set
          const result = await fetch(
            `https://open-api.tiktok.com/user/info/?access_token=${accessToken}`,
            {
              method: 'POST',
              body: JSON.stringify({
                fields: [
                  'open_id',
                  'username',
                  'display_name',
                  'avatar_url',
                  'avatar_large_url',
                  'profile_deep_link',
                  'is_verified'
                ]
              })
            }
          )
          const resultJson = await result.json()
          const tikTokProfile = resultJson.data.user
          onSuccess(tikTokProfile.open_id, tikTokProfile)
        } catch (e) {
          console.log(e)
        }
      })
    },
    [withTikTokAuth, onSuccess, onClick]
  )

  return <TikTokButton {...buttonProps} onClick={handleClick} />
}
