import { createContext } from 'react'

import { AudiusSdk } from '@audius/sdk'
import { ReportToSentryArgs } from '../models'
import type { AudiusAPIClient } from 'services/audius-api-client'
import { AudiusBackend } from 'services/index'

export type AudiusQueryContextType = {
  apiClient: AudiusAPIClient
  audiusSdk: () => Promise<AudiusSdk>
  audiusBackend: AudiusBackend
  reportToSentry: (args: ReportToSentryArgs) => void
}

export const AudiusQueryContext = createContext<AudiusQueryContextType | null>(
  null
)
