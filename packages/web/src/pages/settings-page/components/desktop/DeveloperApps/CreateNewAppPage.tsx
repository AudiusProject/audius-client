import { useCallback, useEffect, useState } from 'react'

import {
  Status,
  accountSelectors,
  developerAppSchema,
  useAddDeveloperApp,
  Name,
  DEVELOPER_APP_DESCRIPTION_MAX_LENGTH,
  DEVELOPER_APP_NAME_MAX_LENGTH
} from '@audius/common'
import { Button, ButtonType } from '@audius/stems'
import { Form, Formik } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { make, useRecord } from 'common/store/analytics/actions'
import { TextAreaField, TextField } from 'components/form-fields'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useSelector } from 'utils/reducer'

import styles from './CreateNewAppPage.module.css'
import { CreateAppPageProps, CreateAppsPages } from './types'
const { getUserId } = accountSelectors

type DeveloperAppValues = z.input<typeof developerAppSchema>

const messages = {
  appNameLabel: 'App Name',
  descriptionLabel: 'Short Description',
  cancel: 'Cancel',
  create: 'Create Key',
  creating: 'Creating Key',
  miscError: 'Sorry, something went wrong. Please try again later.'
}

type CreateNewAppPageProps = CreateAppPageProps

export const CreateNewAppPage = (props: CreateNewAppPageProps) => {
  const { setPage } = props
  const userId = useSelector(getUserId) as number
  const record = useRecord()

  const [addDeveloperApp, result] = useAddDeveloperApp()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { status, data, errorMessage } = result

  useEffect(() => {
    if (status === Status.SUCCESS && data) {
      setPage(CreateAppsPages.APP_DETAILS, data)
      record(
        make(Name.DEVELOPER_APP_CREATE_SUCCESS, {
          name: data.name,
          apiKey: data.apiKey
        })
      )
    }
  }, [data, record, setPage, status])

  useEffect(() => {
    if (status === Status.ERROR) {
      setSubmitError(messages.miscError)
      record(
        make(Name.DEVELOPER_APP_CREATE_ERROR, {
          error: errorMessage
        })
      )
    }
  }, [errorMessage, record, status])

  const handleSubmit = useCallback(
    (values: DeveloperAppValues) => {
      setSubmitError(null)
      record(
        make(Name.DEVELOPER_APP_CREATE_SUBMIT, {
          name: values.name,
          description: values.description
        })
      )
      addDeveloperApp(values)
    },
    [addDeveloperApp, record]
  )

  const initialValues: DeveloperAppValues = {
    userId,
    name: '',
    description: ''
  }

  const isSubmitting = status !== Status.IDLE && status !== Status.ERROR
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
            label={messages.appNameLabel}
            disabled={isSubmitting}
            maxLength={DEVELOPER_APP_NAME_MAX_LENGTH}
          />
          <TextAreaField
            name='description'
            placeholder={messages.descriptionLabel}
            showMaxLength
            maxLength={DEVELOPER_APP_DESCRIPTION_MAX_LENGTH}
            disabled={isSubmitting}
          />
          <div className={styles.actionsContainer}>
            <Button
              buttonType='button'
              text={messages.cancel}
              fullWidth
              type={ButtonType.COMMON_ALT}
              disabled={isSubmitting}
              onClick={() => setPage(CreateAppsPages.YOUR_APPS)}
            />
            <Button
              buttonType='submit'
              text={isSubmitting ? messages.creating : messages.create}
              fullWidth
              rightIcon={
                isSubmitting ? (
                  <LoadingSpinner className={styles.creatingSpinner} />
                ) : undefined
              }
              disabled={isSubmitting}
            />
          </div>
          {submitError == null ? null : (
            <div className={styles.errorContainer}>
              <span className={styles.errorText}>{messages.miscError}</span>
            </div>
          )}
        </Form>
      )}
    </Formik>
  )
}
