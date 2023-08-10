import { useCallback, useMemo } from 'react'

import {
  Nullable,
  ID,
  useGetTrackById,
  FieldVisibility,
  Remix,
  encodeHashId
} from '@audius/common'
import { get, set } from 'lodash'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { ReactComponent as IconRemix } from 'assets/img/iconRemixGray.svg'
import {
  ContextualMenu,
  SelectedValue
} from 'components/data-entry/ContextualMenu'
import { Text } from 'components/typography'
import { fullTrackPage } from 'utils/route'

import { useTrackField } from '../../hooks'
import { SingleTrackEditValues } from '../../types'

import styles from './RemixSettingsField.module.css'
import { RemixSettingsMenuFields } from './RemixSettingsMenuFields'
import { TrackInfo } from './TrackInfo'
import {
  IS_REMIX,
  REMIX_LINK,
  REMIX_OF,
  RemixSettingsFieldSchema,
  RemixSettingsFormValues,
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

  const isRemix = Boolean(remixOf && remixOf?.tracks.length > 0)

  const initialValues = useMemo(() => {
    const initialValues = { parentTrackId }
    set(initialValues, SHOW_REMIXES, showRemixes)
    set(initialValues, IS_REMIX, isRemix)
    set(initialValues, REMIX_LINK, remixLink)
    return initialValues as unknown as RemixSettingsFormValues
  }, [showRemixes, isRemix, remixLink, parentTrackId])

  const handleSubmit = useCallback(
    (values: RemixSettingsFormValues) => {
      const showRemixes = get(values, SHOW_REMIXES)
      const isRemix = get(values, IS_REMIX)
      const { parentTrackId } = values

      setShowRemixes(!!showRemixes)

      setRemixOf(
        isRemix && parentTrackId
          ? {
              tracks: [
                // @ts-expect-error
                { parent_track_id: encodeHashId(parentTrackId) } as Remix
              ]
            }
          : null
      )
    },
    [setShowRemixes, setRemixOf]
  )

  const renderValue = useCallback(() => {
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
  }, [parentTrackId, showRemixes])

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.description}
      renderValue={renderValue}
      menuFields={<RemixSettingsMenuFields />}
      icon={<IconRemix />}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={toFormikValidationSchema(RemixSettingsFieldSchema)}
    />
  )
}
