import { useUserById } from '../../../../api/user/useUserById'

export const FeedPageUserTestThing = () => {
  const { user } = useUserById(395)

  return <>{user?.name}</>
}
