import { useCallback, useState } from 'react'

import { Button, ButtonSize, ButtonType } from '@audius/stems'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import DropdownInput from 'components/data-entry/DropdownInput'
import Switch from 'components/switch/Switch'

import styles from './AdvancedSearchFilters.module.css'

const messages = {
  filterKey: 'Filter by Key:',
  filterKeyPlaceholder: 'e.g. B Major',
  filterKeyInputLabel: 'Key Filter',
  includeHarmonic: 'Include Harmonic Keys',
  filterBPM: 'Filter by BPM:',
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

const KEYS = [...MAJOR_KEYS, ...MINOR_KEYS]

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

const getDefaults = (filters: Record<string, any>) => {
  if (typeof filters.filter_keys === 'string') {
    filters.filter_keys = [filters.filter_keys]
  }
  return {
    filterKey: filters.filter_keys?.[0],
    harmonicKeys:
      filters.filter_keys?.length > 1
        ? filters.filter_keys.slice(1)
        : undefined,
    bpmMin: filters.bpm_min,
    bpmMax: filters.bpm_max
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
    !!defaults.bpmMax || !!defaults.bpmMin
  )
  const [bpmMin, setBpmMin] = useState(defaults.bpmMin)
  const [bpmMax, setBpmMax] = useState(defaults.bpmMax)

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
    if (shouldFilterBPM) {
      if (bpmMin) {
        searchParams.append('bpm_min', bpmMin)
      }
      if (bpmMax) {
        searchParams.append('bpm_max', bpmMax)
      }
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
    filterKey,
    harmonicKeys,
    bpmMin,
    bpmMax
  ])

  return (
    <div className={styles.root}>
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
        <input
          className={styles.input}
          type='number'
          value={bpmMin}
          onChange={(e) => setBpmMin(parseInt(e.target.value))}
        />
        to
        <input
          className={styles.input}
          type='number'
          value={bpmMax}
          onChange={(e) => setBpmMax(parseInt(e.target.value))}
        />
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
