import { useCallback, useMemo } from 'react'

import { Nullable, creativeCommons } from '@audius/common'
import { SegmentedControl } from '@audius/stems'
import cn from 'classnames'
import { Formik, useField } from 'formik'

import { ReactComponent as IconCreativeCommons } from 'assets/img/iconCreativeCommons.svg'
import { InputV2, InputV2Variant } from 'components/data-entry/InputV2'
import { Divider } from 'components/divider'
import typeStyles from 'components/typography/typography.module.css'

import { ModalField } from '../fields/ModalField'
import { SwitchRowField } from '../fields/SwitchRowField'
import { computeLicenseIcons } from '../utils/computeLicenseIcons'

import styles from './AttributionModalForm.module.css'
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
  [AI_USER_ID]?: string
}

export const AttributionModalForm = () => {
  const initialValues = useMemo(() => {
    const initialValues = {}
    // set(initialValues, SHOW_REMIXES, showRemixesValue)
    return initialValues as AttributionFormValues
  }, [])

  const onSubmit = useCallback((values: AttributionFormValues) => {
    //   setShowRemixesValue(get(values, SHOW_REMIXES))
  }, [])

  const preview = (
    <div className={styles.preview}>
      <div className={typeStyles.titleLarge}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
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
  const [aiUserIdField] = useField(AI_USER_ID)
  const [isrcField] = useField(ISRC)
  const [iswcField] = useField(ISWC)

  const [{ value: allowAttribution }, , { setValue: setAllowAttribution }] =
    useField<boolean>('licenseType.allowAttribution')
  const [{ value: commercialUse }, , { setValue: setCommercialUse }] =
    useField<boolean>('licenseType.commercialUse')
  const [{ value: derivativeWorks }, , { setValue: setDerivateWorks }] =
    useField<Nullable<boolean>>('licenseType.derivativeWorks')

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
    <div className={cn(styles.col, styles.gap4)}>
      <SwitchRowField
        name={IS_AI_ATTRIBUTED}
        header={messages.aiGenerated.header}
        description={messages.aiGenerated.description}
      >
        {/* TODO: should be a user search autofill field */}
        <InputV2
          {...aiUserIdField}
          placeholder={messages.aiGenerated.placeholder}
        />
      </SwitchRowField>
      <Divider />
      <div className={styles.isCode}>
        <div
          className={typeStyles.titleLarge}
        >{`${messages.isrc.header} / ${messages.iswc.header}`}</div>
        <span className={cn(styles.row, styles.gap6)}>
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
      <div className={cn(styles.col, styles.gap6)}>
        <div className={typeStyles.titleLarge}>{messages.licenseType}</div>
        <div className={styles.attributionCommercialRow}>
          <div
            className={cn(styles.col, styles.gap2, styles.attributionRowItem)}
          >
            <div className={typeStyles.titleMedium}>
              {messages.allowAttribution.header}
            </div>
            <SegmentedControl
              defaultSelected={allowAttribution}
              options={allowAttributionValues}
              onSelectOption={setAllowAttribution}
            />
          </div>
          <Divider className={styles.verticalDivider} type='vertical' />
          <div
            className={cn(styles.col, styles.gap2, styles.attributionRowItem, {
              [styles.disabled]: !allowAttribution
            })}
          >
            <div className={typeStyles.titleMedium}>
              {messages.commercialUse.header}
            </div>
            <SegmentedControl
              fullWidth
              defaultSelected={commercialUse}
              options={commercialUseValues}
              onSelectOption={setCommercialUse}
              disabled={!allowAttribution}
            />
          </div>
        </div>
        <div className={cn(styles.col, styles.gap2)}>
          <div
            className={cn(typeStyles.titleMedium, {
              [styles.disabled]: !allowAttribution
            })}
          >
            {messages.derivativeWorks.header}
          </div>
          <SegmentedControl
            fullWidth
            defaultSelected={derivativeWorks}
            options={derivativeWorksValues}
            onSelectOption={setDerivateWorks}
            disabled={!allowAttribution}
          />
        </div>
      </div>
      <div>
        {/* {licenseIcons ? (
          <div>
            {licenseIcons.map(
              ([Icon, key]: [ComponentType<SvgProperties>, string]) => (
                <Icon key={key} />
              )
            )}
          </div>
        ) : null} */}
        <div>{licenseType}</div>
        {licenseDescription ? <div>{licenseDescription}</div> : null}
      </div>
    </div>
  )
}
