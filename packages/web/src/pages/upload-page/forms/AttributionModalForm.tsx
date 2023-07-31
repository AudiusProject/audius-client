import { useCallback, useMemo } from 'react'

import { Nullable, creativeCommons } from '@audius/common'
import { SegmentedControl } from '@audius/stems'
import cn from 'classnames'
import { Formik, useField } from 'formik'
import { get, set } from 'lodash'

import { ReactComponent as IconCreativeCommons } from 'assets/img/iconCreativeCommons.svg'
import { AiAttributionDropdown } from 'components/ai-attribution-modal/AiAttributionDropdown'
import { InputV2, InputV2Variant } from 'components/data-entry/InputV2'
import { Divider } from 'components/divider'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'

import { ModalField } from '../fields/ModalField'
import { SwitchRowField } from '../fields/SwitchRowField'
import { computeLicenseIcons } from '../utils/computeLicenseIcons'

import styles from './AttributionModalForm.module.css'
import { useTrackField } from './utils'
const { computeLicense } = creativeCommons

const messages = {
  title: 'Attribution',
  description:
    'Customize attribution settings for licenses, collaborators, and AI-inspired sources.',
  aiGenerated: {
    header: 'Mark this track as AI generated',
    description:
      'If your AI generated track was trained on an existing Audius artist, you can give them credit here. Only users who have opted-in will appear in this list.',
    placeholder: 'Search for Users'
  },
  isrc: {
    header: 'ISRC',
    placeholder: 'CC-XXX-YY-NNNNN'
  },
  iswc: {
    header: 'ISWC',
    placeholder: 'T-345246800-1'
  },
  licenseType: 'License Type',
  allowAttribution: {
    header: 'Allow Attribution?',
    options: {
      false: 'No Attribution',
      true: 'Allow Attribution'
    }
  },
  commercialUse: {
    header: 'Commercial Use?',
    options: {
      false: 'Non-Commercial Use',
      true: 'Commercial Use'
    }
  },
  derivativeWorks: {
    header: 'Derivative Works?',
    options: {
      false: 'Not-Allowed',
      true: 'Share-Alike',
      null: 'Allowed'
    }
  }
}

const IS_AI_ATTRIBUTED = 'isAiAttribution'
const AI_USER_ID = 'ai_attribution_user_id'
const ISRC = 'isrc'
const ISWC = 'iswc'
const ALLOW_ATTRIBUTION = 'licenseType.allowAttribution'
const COMMERCIAL_USE = 'licenseType.commercialUse'
const DERIVATIVE_WORKS = 'licenseType.derivativeWorks'

const allowAttributionValues = [
  { key: false, text: messages.allowAttribution.options.false },
  { key: true, text: messages.allowAttribution.options.true }
]

const commercialUseValues = [
  { key: false, text: messages.commercialUse.options.false },
  { key: true, text: messages.commercialUse.options.true }
]

const derivativeWorksValues = [
  { key: false, text: messages.derivativeWorks.options.false },
  { key: true, text: messages.derivativeWorks.options.true },
  { key: null, text: messages.derivativeWorks.options.null }
]

type AttributionFormValues = {
  [IS_AI_ATTRIBUTED]: boolean
  [AI_USER_ID]?: number
  [ISRC]: string
  [ISWC]: string
  [ALLOW_ATTRIBUTION]: boolean
  [COMMERCIAL_USE]: boolean
  [DERIVATIVE_WORKS]: Nullable<boolean>
}

export const AttributionModalForm = () => {
  const [{ value: aiUserId }, , { setValue: setAiUserId }] =
    useTrackField(AI_USER_ID)
  const [{ value: isrcValue }, , { setValue: setIsrc }] = useTrackField(ISRC)
  const [{ value: iswcValue }, , { setValue: setIswc }] = useTrackField(ISWC)
  const [{ value: allowAttribution }, , { setValue: setAllowAttribution }] =
    useTrackField(ALLOW_ATTRIBUTION)
  const [{ value: commercialUse }, , { setValue: setCommercialUse }] =
    useTrackField(COMMERCIAL_USE)
  const [{ value: derivativeWorks }, , { setValue: setDerivateWorks }] =
    useTrackField(DERIVATIVE_WORKS)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, AI_USER_ID, aiUserId)
    if (aiUserId) {
      set(initialValues, IS_AI_ATTRIBUTED, true)
    }
    set(initialValues, ISRC, isrcValue)
    set(initialValues, ISWC, iswcValue)
    set(initialValues, ALLOW_ATTRIBUTION, allowAttribution)
    set(initialValues, COMMERCIAL_USE, commercialUse)
    set(initialValues, DERIVATIVE_WORKS, derivativeWorks)
    return initialValues as AttributionFormValues
  }, [
    aiUserId,
    allowAttribution,
    commercialUse,
    derivativeWorks,
    isrcValue,
    iswcValue
  ])

  const onSubmit = useCallback(
    (values: AttributionFormValues) => {
      if (get(values, IS_AI_ATTRIBUTED)) {
        setAiUserId(get(values, AI_USER_ID))
      } else {
        setAiUserId(undefined)
      }
      setIsrc(get(values, ISRC))
      setIswc(get(values, ISWC))
      setAllowAttribution(get(values, ALLOW_ATTRIBUTION))
      if (get(values, ALLOW_ATTRIBUTION)) {
        setCommercialUse(get(values, COMMERCIAL_USE))
        setDerivateWorks(get(values, DERIVATIVE_WORKS))
      } else {
        setCommercialUse(false)
        setDerivateWorks(false)
      }
    },
    [
      setAiUserId,
      setAllowAttribution,
      setCommercialUse,
      setDerivateWorks,
      setIsrc,
      setIswc
    ]
  )

  const preview = (
    <div className={cn(layoutStyles.col, layoutStyles.gap2)}>
      <Text variant='title' size='large'>
        {messages.title}
      </Text>
      <Text>{messages.description}</Text>
    </div>
  )

  return (
    <Formik<AttributionFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <ModalField
        title={messages.title}
        icon={<IconCreativeCommons className={styles.titleIcon} />}
        preview={preview}
      >
        <AttributionModalFields />
      </ModalField>
    </Formik>
  )
}

const AttributionModalFields = () => {
  const [aiUserIdField, , { setValue: setAiUserId }] = useField({
    name: AI_USER_ID,
    type: 'select'
  })
  const [isrcField] = useField(ISRC)
  const [iswcField] = useField(ISWC)

  const [{ value: allowAttribution }, , { setValue: setAllowAttribution }] =
    useField<boolean>(ALLOW_ATTRIBUTION)
  const [{ value: commercialUse }, , { setValue: setCommercialUse }] =
    useField<boolean>(COMMERCIAL_USE)
  const [{ value: derivativeWorks }, , { setValue: setDerivateWorks }] =
    useField<Nullable<boolean>>(DERIVATIVE_WORKS)

  const { licenseType, licenseDescription } = computeLicense(
    allowAttribution,
    commercialUse,
    derivativeWorks
  )

  const licenseIcons = computeLicenseIcons(
    allowAttribution,
    commercialUse,
    derivativeWorks
  )

  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
      <SwitchRowField
        name={IS_AI_ATTRIBUTED}
        header={messages.aiGenerated.header}
        description={messages.aiGenerated.description}
      >
        <AiAttributionDropdown
          {...aiUserIdField}
          onSelect={(value: AttributionFormValues[typeof AI_USER_ID]) =>
            setAiUserId(value)
          }
        />
      </SwitchRowField>
      <Divider />
      <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
        <Text variant='title' size='large'>
          {`${messages.isrc.header} / ${messages.iswc.header}`}
        </Text>
        <span className={cn(layoutStyles.row, layoutStyles.gap6)}>
          <InputV2
            {...isrcField}
            variant={InputV2Variant.ELEVATED_PLACEHOLDER}
            label={messages.isrc.header}
            placeholder={messages.isrc.placeholder}
          />
          <InputV2
            {...iswcField}
            variant={InputV2Variant.ELEVATED_PLACEHOLDER}
            label={messages.iswc.header}
            placeholder={messages.iswc.placeholder}
          />
        </span>
      </div>
      <Divider />
      <div className={cn(layoutStyles.col, layoutStyles.gap6)}>
        <Text variant='title' size='large'>
          {messages.licenseType}
        </Text>
        <div className={styles.attributionCommercialRow}>
          <div
            className={cn(
              styles.attributionRowItem,
              layoutStyles.col,
              layoutStyles.gap2
            )}
          >
            <Text variant='title' size='medium'>
              {messages.allowAttribution.header}
            </Text>
            <SegmentedControl
              // @ts-ignore boolean support works
              selected={allowAttribution}
              // @ts-ignore boolean support works
              options={allowAttributionValues}
              // @ts-ignore
              onSelectOption={setAllowAttribution}
            />
          </div>
          <Divider className={styles.verticalDivider} type='vertical' />
          <div
            className={cn(
              styles.attributionRowItem,
              layoutStyles.col,
              layoutStyles.gap2,
              {
                [styles.disabled]: !allowAttribution
              }
            )}
          >
            <Text variant='title' size='medium'>
              {messages.commercialUse.header}
            </Text>
            <SegmentedControl
              fullWidth
              // @ts-ignore boolean support works
              selected={commercialUse}
              // @ts-ignore boolean support works
              options={commercialUseValues}
              // @ts-ignore
              onSelectOption={setCommercialUse}
              disabled={!allowAttribution}
            />
          </div>
        </div>
        <div className={cn(layoutStyles.col, layoutStyles.gap2)}>
          <Text
            className={cn({
              [styles.disabled]: !allowAttribution
            })}
            variant='title'
            size='medium'
          >
            {messages.derivativeWorks.header}
          </Text>
          <SegmentedControl
            fullWidth
            // @ts-ignore boolean support works
            selected={derivativeWorks}
            // @ts-ignore boolean support works
            options={derivativeWorksValues}
            // @ts-ignore
            onSelectOption={setDerivateWorks}
            disabled={!allowAttribution}
          />
        </div>
      </div>
      <div className={styles.license}>
        <div className={cn(layoutStyles.row, layoutStyles.gap2)}>
          {licenseIcons ? (
            <div className={cn(layoutStyles.row, layoutStyles.gap1)}>
              {licenseIcons.map(([Icon, key]) => (
                <Icon key={key} />
              ))}
            </div>
          ) : null}
          <Text variant='title' size='medium'>
            {licenseType}
          </Text>
        </div>
        {licenseDescription ? (
          <Text size='small'>{licenseDescription}</Text>
        ) : null}
      </div>
    </div>
  )
}
