import type { Track, UserMetadata, Nullable, ID, RemixOf } from '@audius/common'
import {
  getPathFromTrackUrl,
  useGetTrackByPermalink,
  SquareSizes,
  accountSelectors
} from '@audius/common'
import { Formik, useField } from 'formik'
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

import { ModalField } from './ModalField'
import styles from './RemixModalForm.module.css'
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

export const HIDE_REMIX_FIELD_NAME = 'hide_remixes'
export const REMIX_OF_FIELD_NAME = 'remix_of'
export const REMIX_LINK_FIELD_NAME = 'remix_of_link'

export type RemixFormValues = {
  [REMIX_OF_FIELD_NAME]: RemixOf | null
  [HIDE_REMIX_FIELD_NAME]: boolean
  [REMIX_LINK_FIELD_NAME]: string
}

type RemixModalFormProps = {
  initialValues: RemixFormValues
  onSubmit: (values: RemixFormValues) => void
}

export const RemixModalForm = (props: RemixModalFormProps) => {
  const { initialValues, onSubmit } = props

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
    </div>
  )

  return (
    <Formik<RemixFormValues>
      initialValues={
        initialValues ?? {
          remix_of: null,
          hideRemixes: false
        }
      }
      onSubmit={onSubmit}
    >
      <ModalField
        title={messages.title}
        icon={<IconRemix className={styles.titleIcon} />}
        preview={preview}
      >
        <RemixModalFields />
      </ModalField>
    </Formik>
  )
}

const RemixModalFields = () => {
  const [linkField] = useField(REMIX_LINK_FIELD_NAME)
  const permalink = getPathFromTrackUrl(linkField.value)
  const currentUserId = useSelector(getUserId)
  const { data: track } = useGetTrackByPermalink(
    {
      permalink,
      currentUserId
    },
    { disabled: !permalink }
  )

  return (
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
  )
}

type TrackInfoProps = {
  track: Track | null
  user: UserMetadata | null
}

const TrackInfo = ({ track, user }: TrackInfoProps) => {
  const image = useTrackCoverArt(
    track?.track_id || null,
    track?._cover_art_sizes || null,
    SquareSizes.SIZE_150_BY_150
  )

  if (!track || !user) return null
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
}
