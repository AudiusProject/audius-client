import { useCallback, useMemo } from 'react'

import {
  Nullable,
  ID,
  useGetTrackById,
  FieldVisibility,
  Remix
} from '@audius/common'

import { ReactComponent as IconRemix } from 'assets/img/iconRemixGray.svg'
import {
  ContextualMenu,
  SelectedValue
} from 'components/data-entry/ContextualMenu'
import { Text } from 'components/typography'
import { fullTrackPage } from 'utils/route'

import { SingleTrackEditValues } from '../../forms/types'
import { useTrackField } from '../../forms/utils'

import styles from './RemixSettingsField.module.css'
import { RemixSettingsMenuFields } from './RemixSettingsMenuFields'
import { TrackInfo } from './TrackInfo'
import {
  IS_REMIX,
  REMIX_LINK,
  REMIX_OF,
  SHOW_REMIXES,
  SHOW_REMIXES_BASE
} from './types'

const messages = {
  title: 'Remix Settings',
  description:
    'Mark your music as a remix, tag the original track, and customize remix settings.',
  remixOf: 'Remix of',
  remixesHidden: 'Remixes Hidden'
}

export type RemixOfField = Nullable<{ tracks: { parent_track_id: ID }[] }>

type RemixSettingsFieldValue = {
  [SHOW_REMIXES]: boolean
  parentTrackId?: ID
}

export type MenuFormValues = {
  [SHOW_REMIXES_BASE]: boolean
  [IS_REMIX]: boolean
  [REMIX_LINK]: string
  parentTrackId?: ID
}

/**
 * This is a subform that expects to exist within a parent TrackEdit form.
 * The useField calls reference the outer form's fields which much match the name constants.
 */
export const RemixSettingsField = () => {
  // These refer to the field in the outer EditForm
  const [{ value: showRemixes }, , { setValue: setShowRemixes }] =
    useTrackField<FieldVisibility[typeof SHOW_REMIXES_BASE]>(SHOW_REMIXES)
  const [{ value: remixOf }, , { setValue: setRemixOf }] =
    useTrackField<SingleTrackEditValues[typeof REMIX_OF]>(REMIX_OF)

  const parentTrackId = remixOf?.tracks[0].parent_track_id
  const { data: remixOfTrack } = useGetTrackById(
    { id: parentTrackId! },
    { disabled: !parentTrackId }
  )

  const remixLink = remixOfTrack?.permalink
    ? fullTrackPage(remixOfTrack?.permalink)
    : ''

  const value = useMemo(
    () => ({
      [SHOW_REMIXES]: showRemixes,
      parentTrackId
    }),
    [showRemixes, parentTrackId]
  )

  const isRemix = Boolean(remixOf && remixOf?.tracks.length > 0)

  const initialValues = useMemo(() => {
    return {
      [SHOW_REMIXES_BASE]: showRemixes,
      [IS_REMIX]: isRemix,
      [REMIX_LINK]: remixLink,
      parentTrackId
    }
  }, [showRemixes, isRemix, remixLink, parentTrackId])

  const handleSubmit = useCallback(
    (values: MenuFormValues) => {
      const {
        [SHOW_REMIXES_BASE]: showRemixes,
        [IS_REMIX]: isRemix,
        parentTrackId
      } = values

      setShowRemixes(showRemixes)

      setRemixOf(
        isRemix && parentTrackId
          ? { tracks: [{ parent_track_id: parentTrackId } as Remix] }
          : null
      )
    },
    [setShowRemixes, setRemixOf]
  )

  const renderValue = useCallback((value: RemixSettingsFieldValue) => {
    const { [SHOW_REMIXES]: showRemixes, parentTrackId } = value
    if (showRemixes && !parentTrackId) return null

    return (
      <div className={styles.selectedValue}>
        {!showRemixes ? <SelectedValue label={messages.remixesHidden} /> : null}
        {parentTrackId ? (
          <div className={styles.remixOfValue}>
            <Text variant='label' size='small'>
              {messages.remixOf}:
            </Text>
            <TrackInfo trackId={parentTrackId} />
          </div>
        ) : null}
      </div>
    )
  }, [])

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.description}
      value={value}
      renderValue={renderValue}
      menuFields={<RemixSettingsMenuFields />}
      icon={<IconRemix />}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  )
}
