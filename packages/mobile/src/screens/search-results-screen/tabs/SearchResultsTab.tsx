import { ReactNode } from 'react'

import Status from 'audius-client/src/common/models/Status'
import { getSearchStatus } from 'audius-client/src/common/store/pages/search-results/selectors'

import LoadingSpinner from 'app/components/loading-spinner'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { EmptyResults } from '../EmptyResults'

type SearchResultsTabProps = {
  children: ReactNode
  noResults?: boolean
}

export const SearchResultsTab = (props: SearchResultsTabProps) => {
  const { children, noResults } = props
  const status = useSelectorWeb(getSearchStatus)

  if (status === Status.LOADING) return <LoadingSpinner />

  if (noResults) return <EmptyResults />

  return <>{children}</>
}
