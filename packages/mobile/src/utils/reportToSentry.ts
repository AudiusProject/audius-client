import type { ReportToSentryArgs, ErrorLevel } from '@audius/common'
import { getErrorMessage } from '@audius/common'
import * as Sentry from '@sentry/react-native'

import { versionInfo } from './appVersionWithCodepush'

const Levels: { [level in ErrorLevel]: Sentry.Severity } = {
  Critical: Sentry.Severity.Critical,
  Warning: Sentry.Severity.Warning,
  Fatal: Sentry.Severity.Fatal,
  Debug: Sentry.Severity.Debug,
  Error: Sentry.Severity.Error,
  Info: Sentry.Severity.Info,
  Log: Sentry.Severity.Log
}

export const reportToSentry = async ({
  level,
  additionalInfo,
  error,
  name
}: ReportToSentryArgs) => {
  try {
    Sentry.withScope((scope) => {
      scope.setExtra('mobileClientVersionInclOTA', versionInfo ?? 'unknown')
      if (level) {
        const sentryLevel = Levels[level]
        scope.setLevel(sentryLevel)
      }
      if (additionalInfo) {
        console.debug(
          `Additional error info: ${JSON.stringify(additionalInfo)}`
        )
        scope.setExtras(additionalInfo)
      }
      if (name) {
        error.name = name
      }
      Sentry.captureException(error)
    })
  } catch (error) {
    console.error(`Got error trying to log error: ${getErrorMessage(error)}`)
  }
}
