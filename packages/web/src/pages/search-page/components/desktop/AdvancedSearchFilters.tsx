import { useState } from 'react'

import { Button, ButtonSize, ButtonType } from '@audius/stems'

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

export const AdvancedSearchFilters = () => {
  const [shouldFilterKey, setShouldFilterKey] = useState(false)
  const [filterKey, setFilterKey] = useState<string>()
  const [shouldFilterHarmonicKey, setShouldFilterHarmonicKey] = useState(false)
  const harmonicKeys = getHarmonicKeys(filterKey)
  const [shouldFilterBPM, setShouldFilterBPM] = useState(false)
  const [bpmMin, setBpmMin] = useState<number>(0)
  const [bpmMax, setBpmMax] = useState<number>(200)
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
      />
    </div>
  )
}
