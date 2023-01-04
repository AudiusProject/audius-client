import type { ReactNode } from 'react'
import { PureComponent } from 'react'

import * as Sentry from '@sentry/react-native'

type NotificationErrorBoundaryProps = {
  children: ReactNode
}

export class NotificationErrorBoundary extends PureComponent<NotificationErrorBoundaryProps> {
  state = {
    error: null
  }

  componentDidCatch(error: Error | null, errorInfo: any) {
    this.setState({ error: error?.message })

    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo)
      Sentry.captureException(error)
    })
  }

  render() {
    const { error } = this.state
    const { children } = this.props

    if (error) return null
    return <>{children}</>
  }
}
