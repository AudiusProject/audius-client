import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Format,
  TokenValueInput,
  RadioPillButton,
  RadioButtonGroup
} from '@audius/stems'
import { debounce } from 'lodash'

import IconAUDIOSrc from 'assets/img/iconAUDIO.png'

import styles from './AudioAmountPicker.module.css'

const messages = {
  selectAnAmount: 'Select an amount',
  buy: 'Buy',
  amountOfAudio: 'Amount of $AUDIO',
  customAmount: 'Custom Amount'
}

const INPUT_DEBOUNCE_MS = 200

const IconAUDIO = () => {
  return (
    <img src={IconAUDIOSrc} alt={'AUDIO Token Icon'} width={32} height={32} />
  )
}

const AmountPreview = ({ amount }: { amount?: string }) => {
  return (
    <div className={styles.amountPreviewContainer}>
      {amount && amount !== '0' ? (
        <>
          <div className={styles.amountPreviewBuy}>{messages.buy}</div>
          <div className={styles.amountPreview}>
            <IconAUDIO />
            {amount} $AUDIO
          </div>
        </>
      ) : (
        messages.selectAnAmount
      )}
    </div>
  )
}

export const AudioAmountPicker = ({
  presetAmounts,
  onAmountChanged
}: {
  presetAmounts: string[]
  onAmountChanged: (amount: string) => void
}) => {
  const [isCustomAmountInputVisible, setIsCustomAmountInputVisible] =
    useState(false)
  const [value, setValue] = useState<string | null>(null)
  const [presetAmount, setPresetAmount] = useState<string>()
  const [customAmount, setCustomAmount] = useState<string>()
  const handleChange = useCallback(
    (e) => {
      const value = e.target.value
      setValue(value)
      if (value === 'custom') {
        setIsCustomAmountInputVisible(true)
        if (customAmount) {
          onAmountChanged(customAmount)
        }
      } else {
        setIsCustomAmountInputVisible(false)
        setPresetAmount(value)
        onAmountChanged(value)
      }
    },
    [customAmount, onAmountChanged]
  )
  const debouncedOnAmountChange = useMemo(
    () => debounce((amount) => onAmountChanged(amount), INPUT_DEBOUNCE_MS),
    [onAmountChanged]
  )
  useEffect(() => {
    debouncedOnAmountChange.cancel()
  }, [debouncedOnAmountChange])
  const handleCustomAmountChange = useCallback(
    (amount) => {
      setCustomAmount(amount)
      debouncedOnAmountChange(amount)
    },
    [setCustomAmount, debouncedOnAmountChange]
  )
  return (
    <>
      {!isCustomAmountInputVisible ? (
        <AmountPreview amount={presetAmount} />
      ) : null}
      <RadioButtonGroup
        className={styles.presetAmountButtons}
        name='AmountPicker'
        value={value}
        onChange={handleChange}
      >
        {presetAmounts.map((amount) => (
          <RadioPillButton
            key={amount}
            name={'amount'}
            className={styles.presetAmountButton}
            label={amount}
            aria-label={`${amount} audio`}
            value={amount}
          />
        ))}
        <RadioPillButton
          className={styles.customAmountButton}
          name={'amount'}
          label={
            <span className={styles.customAmountButtonText}>Custom Amount</span>
          }
          value={'custom'}
        />
      </RadioButtonGroup>
      {isCustomAmountInputVisible ? (
        <TokenValueInput
          rightLabelClassName={styles.customAmountLabel}
          inputClassName={styles.customAmountInput}
          format={Format.INPUT}
          placeholder={'Enter an amount'}
          rightLabel={'$AUDIO'}
          value={customAmount}
          isNumeric={true}
          isWhole={true}
          onChange={handleCustomAmountChange}
        />
      ) : null}
    </>
  )
}
