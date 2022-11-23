import { useCallback, useState } from 'react'

import { ELECTRONIC_PREFIX, GENRES, getCanonicalName } from '@audius/common'
import { Button, ButtonSize, ButtonType } from '@audius/stems'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import DropdownInput from 'components/data-entry/DropdownInput'
import Switch from 'components/switch/Switch'
import { moodMap } from 'utils/moods'

import styles from './AdvancedSearchFilters.module.css'

const messages = {
  filterKey: 'Filter by Key:',
  filterKeyPlaceholder: 'e.g. B Major',
  filterKeyInputLabel: 'Key Filter',
  includeHarmonic: 'Include Harmonic Keys',
  filterBPM: 'Filter by BPM:',
  genre: 'Filter by Genre:',
  genrePlaceholder: 'e.g. Electronic',
  mood: 'Filter by Mood:',
  moodPlaceholder: 'e.g. Energizing',
  within: 'within',
  of: '% of',
  bpm: 'bpm',
  apply: 'Search'
}

const MAJOR_KEYS = [
  'B Major',
  'Gb Major',
  'Db Major',
  'Ab Major',
  'Eb Major',
  'Bb Major',
  'F Major',
  'C Major',
  'G Major',
  'D Major',
  'A Major',
  'E Major'
]
const MINOR_KEYS = [
  'Ab Minor',
  'Eb Minor',
  'Bb Minor',
  'F Minor',
  'C Minor',
  'G Minor',
  'D Minor',
  'A Minor',
  'E Minor',
  'B Minor',
  'Gb Minor',
  'Db Minor'
]
const KEYS = [...MAJOR_KEYS, ...MINOR_KEYS].sort()
const MOODS = Object.keys(moodMap).map((k) => ({
  text: k,
  el: (moodMap as Record<string, JSX.Element>)[k]
}))

const getHarmonicKeys = (key: string | undefined) => {
  console.log(key)
  if (!key) {
    return []
  }
  if (key.split(' ')[1] === 'Major') {
    const index = MAJOR_KEYS.findIndex((k) => k === key)
    return [
      MINOR_KEYS[index],
      MAJOR_KEYS[(index + 11) % 12],
      MAJOR_KEYS[(index + 1) % 12]
    ]
  } else {
    const index = MINOR_KEYS.findIndex((k) => k === key)
    return [
      MAJOR_KEYS[index],
      MINOR_KEYS[(index + 11) % 12],
      MINOR_KEYS[(index + 1) % 12]
    ]
  }
}

type GetDefaultsResult = {
  filterKey: string
  harmonicKeys: string[]
  bpmMidpoint: number
  bpmTolerance: number
  genre: string
  mood: string
}

const getDefaults = (filters: Record<string, any>): GetDefaultsResult => {
  if (typeof filters.filter_keys === 'string') {
    filters.filter_keys = [filters.filter_keys]
  }
  if (filters.bpm_max && filters.bpm_min) {
    filters._bpmMidpoint = Math.round(
      (parseInt(filters.bpm_min) + parseInt(filters.bpm_max)) / 2.0
    )
    filters._bpmTolerance = Math.round(
      ((parseInt(filters.bpm_max) - filters._bpmMidpoint) * 100.0) /
        filters._bpmMidpoint
    )
  }
  return {
    filterKey: filters.filter_keys?.[0],
    harmonicKeys:
      filters.filter_keys?.length > 1
        ? filters.filter_keys.slice(1)
        : undefined,
    bpmMidpoint: filters._bpmMidpoint,
    bpmTolerance: filters._bpmTolerance ?? 5,
    genre: filters.genre,
    mood: filters.mood
  }
}

export const AdvancedSearchFilters = ({
  filters
}: {
  filters: Record<string, any>
}) => {
  const dispatch = useDispatch()
  const defaults = getDefaults(filters)
  console.log(filters)
  console.log(defaults)
  const [shouldFilterKey, setShouldFilterKey] = useState(!!defaults.filterKey)
  const [filterKey, setFilterKey] = useState<string>(defaults.filterKey)
  const [shouldFilterHarmonicKey, setShouldFilterHarmonicKey] = useState(
    !!defaults.harmonicKeys
  )
  const harmonicKeys = getHarmonicKeys(filterKey)
  const [shouldFilterBPM, setShouldFilterBPM] = useState(
    !!defaults.bpmMidpoint && !!defaults.bpmTolerance
  )
  const [bpmMidpoint, setBpmMidpoint] = useState(defaults.bpmMidpoint)
  const [bpmTolerance, setBpmTolerance] = useState(defaults.bpmTolerance)
  const [shouldFilterGenre, setShouldFilterGenre] = useState(!!defaults.genre)
  const [genre, setGenre] = useState(defaults.genre)
  const [shouldFilterMood, setShouldFilterMood] = useState(!!defaults.mood)
  const [mood, setMood] = useState(defaults.mood)

  const bpmMin = Math.max(
    Math.round(bpmMidpoint - (bpmTolerance / 100.0) * bpmMidpoint),
    0
  )
  const bpmMax = Math.round(bpmMidpoint + (bpmTolerance / 100.0) * bpmMidpoint)

  const doSearch = useCallback(() => {
    const searchParams = new URLSearchParams()
    if (shouldFilterKey) {
      searchParams.append('filter_keys', filterKey)
    }
    if (shouldFilterHarmonicKey) {
      for (const harmonicKey of harmonicKeys) {
        searchParams.append('filter_keys', harmonicKey)
      }
    }
    if (shouldFilterBPM && bpmMin !== undefined && bpmMax !== undefined) {
      searchParams.append('bpm_min', bpmMin.toString())
      searchParams.append('bpm_max', bpmMax.toString())
    }
    if (shouldFilterGenre) {
      searchParams.append('genre', genre)
    }
    if (shouldFilterMood) {
      searchParams.append('mood', mood)
    }
    dispatch(
      push({
        pathname: window.location.pathname,
        search: searchParams.toString()
      })
    )
  }, [
    dispatch,
    shouldFilterKey,
    shouldFilterHarmonicKey,
    shouldFilterBPM,
    shouldFilterGenre,
    shouldFilterMood,
    filterKey,
    harmonicKeys,
    bpmMin,
    bpmMax,
    genre,
    mood
  ])

  return (
    <div className={styles.root}>
      <div className={styles.switchGroup}>
        <Switch
          className={styles.switch}
          label={messages.genre}
          isOn={shouldFilterGenre}
          handleToggle={() => {
            setShouldFilterGenre(!shouldFilterGenre)
          }}
        />
        <DropdownInput
          aria-label={messages.genre}
          placeholder={messages.genrePlaceholder}
          mount='parent'
          menu={{ items: GENRES }}
          defaultValue={getCanonicalName(genre) || ''}
          onSelect={(value: string) =>
            setGenre(value.replace(ELECTRONIC_PREFIX, ''))
          }
        />
      </div>

      <div className={styles.switchGroup}>
        <Switch
          className={styles.switch}
          label={messages.mood}
          isOn={shouldFilterMood}
          handleToggle={() => {
            setShouldFilterMood(!shouldFilterMood)
          }}
        />
        <DropdownInput
          aria-label={messages.mood}
          placeholder={messages.moodPlaceholder}
          mount='parent'
          menu={{ items: MOODS }}
          defaultValue={mood}
          onSelect={(value: string) => setMood(value)}
        />
      </div>
      <div className={styles.switchGroup}>
        <Switch
          className={styles.switch}
          label={<>{messages.filterKey}</>}
          isOn={shouldFilterKey}
          handleToggle={() => {
            setShouldFilterKey(!shouldFilterKey)
          }}
        />
        <DropdownInput
          defaultValue={filterKey}
          placeholder={messages.filterKeyPlaceholder}
          menu={{ items: KEYS }}
          aria-label={messages.filterKeyInputLabel}
          onSelect={(value: string) => {
            setShouldFilterKey(true)
            setFilterKey(value)
          }}
        />
      </div>
      <div className={styles.switchGroup}>
        <Switch
          isDisabled={!shouldFilterKey}
          label={
            <>
              {messages.includeHarmonic}
              {harmonicKeys.length > 0 ? `: (${harmonicKeys.join(', ')})` : ''}
            </>
          }
          isOn={shouldFilterHarmonicKey}
          handleToggle={() => {
            setShouldFilterHarmonicKey(!shouldFilterHarmonicKey)
          }}
        />
      </div>
      <div className={styles.switchGroup}>
        <Switch
          label={messages.filterBPM}
          isOn={shouldFilterBPM}
          handleToggle={() => {
            setShouldFilterBPM(!shouldFilterBPM)
          }}
        />
        {messages.within}
        <input
          className={styles.input}
          type='number'
          value={bpmTolerance}
          onChange={(e) => setBpmTolerance(parseInt(e.target.value))}
        />
        {messages.of}
        <input
          className={styles.input}
          type='number'
          value={bpmMidpoint}
          onChange={(e) => {
            setBpmMidpoint(parseInt(e.target.value))
            if (bpmMidpoint !== undefined && bpmTolerance !== undefined) {
              setShouldFilterBPM(true)
            }
          }}
        />
        {messages.bpm}
        {bpmMidpoint !== undefined && bpmTolerance !== undefined
          ? ` (${bpmMin} to ${bpmMax} bpm)`
          : null}
      </div>
      <Button
        text={messages.apply}
        type={ButtonType.PRIMARY_ALT}
        size={ButtonSize.SMALL}
        onClick={doSearch}
      />
    </div>
  )
}
