import { useCallback, useMemo } from 'react'

import {
  Nullable,
  creativeCommons,
  encodeHashId,
  decodeHashId
} from '@audius/common'
import { IconRobot, SegmentedControl } from '@audius/stems'
import cn from 'classnames'
import { useField } from 'formik'
import { get, set } from 'lodash'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { ReactComponent as IconCreativeCommons } from 'assets/img/iconCreativeCommons.svg'
import { Icon } from 'components/Icon'
import { AiAttributionDropdown } from 'components/ai-attribution-modal/AiAttributionDropdown'
import {
  ContextualMenu,
  SelectedValue,
  SelectedValues
} from 'components/data-entry/ContextualMenu'
import { InputV2Variant } from 'components/data-entry/InputV2'
import { Divider } from 'components/divider'
import { TextField } from 'components/form-fields'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'
import { useTrackField } from 'pages/upload-page/hooks'
import { SingleTrackEditValues } from 'pages/upload-page/types'
import { computeLicenseIcons } from 'pages/upload-page/utils/computeLicenseIcons'

import styles from './AttributionField.module.css'
import { SwitchRowField } from './SwitchRowField'

const { computeLicense, ALL_RIGHTS_RESERVED_TYPE } = creativeCommons

const messages = {
  title: 'Attribution',
  description:
    'Customize attribution settings for licenses, collaborators, and AI-inspired sources.',
  isAiGenerated: 'AI-Generated',
  aiGenerated: {
    header: 'Mark this track as AI generated',
    description:
      'If your AI generated track was trained on an existing Audius artist, you can give them credit here. Only users who have opted-in will appear in this list.',
    placeholder: 'Search for Users',
    requiredError: 'Valid user must be selected'
  },
  isrc: {
    header: 'ISRC',
    placeholder: 'CC-XXX-YY-NNNNN',
    validError: 'Must be valid ISRC format'
  },
  iswc: {
    header: 'ISWC',
    placeholder: 'T-345246800-1',
    validError: 'Must be valid ISWC format'
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
  },
  noLicense: 'All Rights Reserved'
}

const IS_AI_ATTRIBUTED = 'isAiAttribution'
const AI_USER_ID = 'ai_attribution_user_id'
const AI_USER_NUM_ID = 'ai_attribution_user_num_id'
const ISRC = 'isrc'
const ISWC = 'iswc'
const LICENSE_TYPE = 'licenseType'
const ALLOW_ATTRIBUTION_BASE = 'allowAttribution'
const ALLOW_ATTRIBUTION = 'licenseType.allowAttribution'
const COMMERCIAL_USE_BASE = 'commercialUse'
const COMMERCIAL_USE = 'licenseType.commercialUse'
const DERIVATIVE_WORKS_BASE = 'derivativeWorks'
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

const isrcRegex = /^[A-Z]{2}-[A-Z\d]{3}-\d{2}-\d{5}$/i
const iswcRegex = /^T-\d{9}-\d$/i

const AttributionFormSchema = z
  .object({
    [IS_AI_ATTRIBUTED]: z.optional(z.boolean()),
    [AI_USER_ID]: z.optional(z.string().nullable()),
    [AI_USER_NUM_ID]: z.optional(z.number().nullable()),
    [ISRC]: z.optional(z.string().nullable()),
    [ISWC]: z.optional(z.string().nullable()),
    [ALLOW_ATTRIBUTION]: z.optional(z.boolean()),
    [COMMERCIAL_USE]: z.optional(z.boolean()),
    [DERIVATIVE_WORKS]: z.optional(z.boolean().nullable())
  })
  .refine((form) => !form[IS_AI_ATTRIBUTED] || form[AI_USER_ID], {
    message: messages.aiGenerated.requiredError,
    path: [AI_USER_ID]
  })
  .refine((form) => !form[ISRC] || isrcRegex.test(form[ISRC]), {
    message: messages.isrc.validError,
    path: [ISRC]
  })
  .refine((form) => !form[ISWC] || iswcRegex.test(form[ISWC]), {
    message: messages.iswc.validError,
    path: [ISWC]
  })

export type AttributionFormValues = z.input<typeof AttributionFormSchema>

export const AttributionField = () => {
  const [{ value: aiUserId }, , { setValue: setAiUserId }] = useTrackField<
    string | undefined
  >(AI_USER_ID)
  const [{ value: isrcValue }, , { setValue: setIsrc }] =
    useTrackField<SingleTrackEditValues[typeof ISRC]>(ISRC)
  const [{ value: iswcValue }, , { setValue: setIswc }] =
    useTrackField<SingleTrackEditValues[typeof ISWC]>(ISWC)
  const [{ value: allowAttribution }, , { setValue: setAllowAttribution }] =
    useTrackField<
      SingleTrackEditValues[typeof LICENSE_TYPE][typeof ALLOW_ATTRIBUTION_BASE]
    >(ALLOW_ATTRIBUTION)
  const [{ value: commercialUse }, , { setValue: setCommercialUse }] =
    useTrackField<
      SingleTrackEditValues[typeof LICENSE_TYPE][typeof COMMERCIAL_USE_BASE]
    >(COMMERCIAL_USE)
  const [{ value: derivativeWorks }, , { setValue: setDerivateWorks }] =
    useTrackField<
      SingleTrackEditValues[typeof LICENSE_TYPE][typeof DERIVATIVE_WORKS_BASE]
    >(DERIVATIVE_WORKS)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, AI_USER_ID, aiUserId)
    set(
      initialValues,
      AI_USER_NUM_ID,
      aiUserId ? decodeHashId(aiUserId) : undefined
    )
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
        setAiUserId(get(values, AI_USER_ID) ?? aiUserId)
      } else {
        setAiUserId(undefined)
      }
      setIsrc(get(values, ISRC) ?? isrcValue)
      setIswc(get(values, ISWC) ?? iswcValue)
      setAllowAttribution(get(values, ALLOW_ATTRIBUTION) ?? allowAttribution)
      if (get(values, ALLOW_ATTRIBUTION)) {
        setCommercialUse(get(values, COMMERCIAL_USE) ?? commercialUse)
        setDerivateWorks(get(values, DERIVATIVE_WORKS) ?? derivativeWorks)
      } else {
        setCommercialUse(false)
        setDerivateWorks(false)
      }
    },
    [
      aiUserId,
      allowAttribution,
      commercialUse,
      derivativeWorks,
      isrcValue,
      iswcValue,
      setAiUserId,
      setAllowAttribution,
      setCommercialUse,
      setDerivateWorks,
      setIsrc,
      setIswc
    ]
  )

  const renderValue = useCallback(() => {
    const value = []

    const { licenseType } = computeLicense(
      !!allowAttribution,
      !!commercialUse,
      derivativeWorks
    )

    if (!licenseType || licenseType === ALL_RIGHTS_RESERVED_TYPE) {
      value.push(<SelectedValue label={messages.noLicense} />)
    }

    const licenseIcons = computeLicenseIcons(
      !!allowAttribution,
      !!commercialUse,
      derivativeWorks
    )

    if (licenseIcons) {
      value.push(
        <SelectedValue>
          {licenseIcons.map(([icon, key]) => (
            <Icon key={key} icon={icon} />
          ))}
        </SelectedValue>
      )
    }
    if (isrcValue) {
      value.push(<SelectedValue label={isrcValue} />)
    }

    if (iswcValue) {
      value.push(<SelectedValue label={iswcValue} />)
    }
    if (aiUserId) {
      value.push(
        <SelectedValue label={messages.isAiGenerated} icon={IconRobot} />
      )
    }
    return <SelectedValues>{value}</SelectedValues>
  }, [
    aiUserId,
    allowAttribution,
    commercialUse,
    derivativeWorks,
    isrcValue,
    iswcValue
  ])

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.description}
      icon={<IconCreativeCommons />}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={toFormikValidationSchema(AttributionFormSchema)}
      menuFields={<AttributionModalFields />}
      renderValue={renderValue}
    />
  )
}

const AttributionModalFields = () => {
  const [aiUserIdField, aiUserHelperFields, { setValue: setAiUserId }] =
    useField({
      name: AI_USER_ID,
      type: 'select'
    })
  const [aiUserNumIdField, , { setValue: setAiUserNumId }] = useField({
    name: AI_USER_NUM_ID
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

  const dropdownHasError =
    aiUserHelperFields.touched && aiUserHelperFields.error

  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
      <SwitchRowField
        name={IS_AI_ATTRIBUTED}
        header={messages.aiGenerated.header}
        description={messages.aiGenerated.description}
      >
        <AiAttributionDropdown
          {...aiUserIdField}
          {...aiUserHelperFields}
          error={dropdownHasError}
          helperText={dropdownHasError && aiUserHelperFields.error}
          value={aiUserNumIdField.value}
          onSelect={(value: SingleTrackEditValues[typeof AI_USER_ID]) => {
            setAiUserId(value ? encodeHashId(value) : null)
            setAiUserNumId(value ?? null)
          }}
        />
      </SwitchRowField>
      <Divider />
      <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
        <Text variant='title' size='large'>
          {`${messages.isrc.header} / ${messages.iswc.header}`}
        </Text>
        <span className={cn(layoutStyles.row, layoutStyles.gap6)}>
          <div className={styles.textFieldContainer}>
            <TextField
              {...isrcField}
              variant={InputV2Variant.ELEVATED_PLACEHOLDER}
              label={messages.isrc.header}
              placeholder={messages.isrc.placeholder}
            />
          </div>
          <div className={styles.textFieldContainer}>
            <TextField
              {...iswcField}
              variant={InputV2Variant.ELEVATED_PLACEHOLDER}
              label={messages.iswc.header}
              placeholder={messages.iswc.placeholder}
            />
          </div>
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
