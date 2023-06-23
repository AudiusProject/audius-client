import type { Track, UserMetadata, Nullable, ID } from '@audius/common'
import {
  getPathFromTrackUrl,
  useGetTrackByPermalink,
  SquareSizes,
  accountSelectors
} from '@audius/common'
import { useField } from 'formik'
import { useSelector } from 'react-redux'

import { ReactComponent as IconRemix } from 'assets/img/iconRemixGray.svg'
import {
  InputV2,
  InputV2Size,
  InputV2Variant
} from 'components/data-entry/InputV2'
import { Divider } from 'components/divider'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'components/user-badges/UserBadges'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'
import { withNullGuard } from 'utils/withNullGuard'

import { ModalField } from './ModalField'
import styles from './RemixModalField.module.css'
import { ToggleRowField } from './ToggleRowField'

const { getUserId } = accountSelectors

const messages = {
  title: 'Remix Settings',
  description:
    'Mark your music as a remix, tag the original track, and customize remix settings.',
  by: 'by',
  hideRemix: {
    header: 'Hide Remixes of This Track',
    description:
      'Enable this option if you want to prevent remixes of your track by other artists from appearing on your track page.'
  },
  remixOf: {
    header: 'Identify as Remix',
    description:
      "Paste the original Audius track link if yours is a remix. Your remix will typically appear on the original track's page.",
    linkLabel: 'Link to Remix'
  }
}

export type RemixOfField = Nullable<{ tracks: { parent_track_id: ID }[] }>

const HIDE_REMIX_FIELD_NAME = 'hide_remixes'
const REMIX_OF_FIELD_NAME = 'remix_of'
const REMIX_LINK_FIELD_NAME = 'remix_of_link'

export const RemixModalField = () => {
  const [linkField] = useField(REMIX_LINK_FIELD_NAME)
  const debugLink = linkField.value?.replace(
    'http://localhost:3001',
    'https://staging.audius.co'
  )
  // const permalink = getPathFromTrackUrl(linkField.value)
  const permalink = getPathFromTrackUrl(debugLink)
  const currentUserId = useSelector(getUserId)

  const { data: track } = useGetTrackByPermalink(
    {
      permalink,
      currentUserId
    },
    { disabled: !permalink }
  )

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
    </div>
  )

  return (
    <ModalField
      title={messages.title}
      icon={<IconRemix className={styles.titleIcon} />}
      preview={preview}
    >
      <div className={styles.fields}>
        <ToggleRowField
          name={HIDE_REMIX_FIELD_NAME}
          header={messages.hideRemix.header}
          description={messages.hideRemix.description}
        />
        <Divider />
        <ToggleRowField
          name={REMIX_OF_FIELD_NAME}
          header={messages.remixOf.header}
          description={messages.remixOf.description}
        >
          <InputV2
            id='remix_of_input'
            variant={InputV2Variant.ELEVATED_PLACEHOLDER}
            label={messages.remixOf.linkLabel}
            size={InputV2Size.LARGE}
            {...linkField}
          />
          {/* @ts-ignore TDOO: need to populate track with cover art sizes */}
          {track ? <TrackInfo user={track.user} track={track} /> : null}
        </ToggleRowField>
      </div>
    </ModalField>
  )
}

type TrackInfoProps = {
  track: Track | null
  user: UserMetadata | null
}

const g = withNullGuard(
  ({ track, user, ...p }: TrackInfoProps) =>
    track && user && { ...p, track, user }
)

const TrackInfo = g(({ track, user }) => {
  const image = useTrackCoverArt(
    track.track_id,
    track._cover_art_sizes,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <div className={styles.track}>
      <DynamicImage wrapperClassName={styles.artwork} image={image} />
      {track.title}
      <div className={styles.by}>{messages.by}</div>
      <div className={styles.artistName}>
        {user.name}
        <UserBadges
          className={styles.iconVerified}
          userId={user.user_id}
          badgeSize={14}
        />
      </div>
    </div>
  )
})
