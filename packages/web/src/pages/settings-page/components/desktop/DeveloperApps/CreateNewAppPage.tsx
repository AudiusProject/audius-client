import { useCallback, useEffect } from 'react'

import {
  Status,
  accountSelectors,
  developerAppSchema,
  useAddDeveloperAppMutation
} from '@audius/common'
import { Button, ButtonType } from '@audius/stems'
import { Form, Formik } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { InputV2Variant } from 'components/data-entry/InputV2'
import { TextAreaField } from 'components/form-fields/TextAreaField'
import { TextField } from 'components/form-fields/TextField'
import { useSelector } from 'utils/reducer'

import styles from './DeveloperApps.module.css'
import { CreateAppPageProps, CreateAppsPages } from './types'
const { getUserId } = accountSelectors

type DeveloperAppValues = z.input<typeof developerAppSchema>

const messages = {
  appNameLabel: 'App Name',
  descriptionLabel: 'Short Description',
  cancel: 'Cancel',
  create: 'Create Key'
}

type CreateNewAppPageProps = CreateAppPageProps

export const CreateNewAppPage = (props: CreateNewAppPageProps) => {
  const { setPage } = props
  const userId = useSelector(getUserId) as number

  const [addDeveloperApp, result] = useAddDeveloperAppMutation()

  const { status, data } = result

  useEffect(() => {
    if (status === Status.SUCCESS && data) {
      setPage(CreateAppsPages.APP_DETAILS, data)
    }
  })

  const handleSubmit = useCallback(
    (values: DeveloperAppValues) => {
      addDeveloperApp(values)
    },
    [addDeveloperApp]
  )

  const initialValues: DeveloperAppValues = {
    userId,
    name: '',
    description: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={toFormikValidationSchema(developerAppSchema)}
    >
      {() => (
        <Form className={styles.content}>
          <TextField
            name='name'
            variant={InputV2Variant.ELEVATED_PLACEHOLDER}
            label={messages.appNameLabel}
          />
          <TextAreaField
            name='description'
            placeholder={messages.descriptionLabel}
            showMaxLength
            maxLength={developerAppSchema.shape.description.maxLength as number}
          />
          <div className={styles.createAppFooter}>
            <Button
              text={messages.cancel}
              fullWidth
              type={ButtonType.COMMON_ALT}
              onClick={() => setPage(CreateAppsPages.YOUR_APPS)}
            />
            <Button buttonType='submit' text={messages.create} fullWidth />
          </div>
        </Form>
      )}
    </Formik>
  )
}
