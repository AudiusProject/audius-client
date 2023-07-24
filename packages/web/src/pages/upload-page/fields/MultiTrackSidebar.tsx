import { Button } from '@audius/stems'

type MultiTrackSidebarProps = {
  index: number
  setIndex: (index: number) => void
}

export const MultiTrackSidebar = (props: MultiTrackSidebarProps) => {
  const { index, setIndex } = props
  return (
    <div>
      MultiTrackSidebar
      <Button text={'Next'} onClick={() => setIndex(index + 1)} />
      <Button text={'Prev'} onClick={() => setIndex(index - 1)} />
    </div>
  )
}
