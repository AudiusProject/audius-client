import { useContext, useEffect } from 'react'

import Header from 'components/header/mobile/Header'
import { HeaderContext } from 'components/header/mobile/HeaderContextProvider'

type UseHeaderProps = {
  title?: string
  className?: string
}

/** Sets up a mobile header with title and style */
export const useMobileHeader = ({ title, className }: UseHeaderProps = {}) => {
  const { setHeader } = useContext(HeaderContext)
  useEffect(() => {
    setHeader(<Header title={title} className={className} />)
  }, [setHeader, title, className])
}
