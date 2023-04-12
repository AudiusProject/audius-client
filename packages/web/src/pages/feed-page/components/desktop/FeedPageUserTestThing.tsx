import { useUserById } from 'api/user/useUserById'

export const FeedPageUserTestThing = () => {
  const { user, error, status } = useUserById(395)

  return (
    <>
      {user?.name} {status} {error?.status} {error?.message}
    </>
  )
}
