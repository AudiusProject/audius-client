import React from 'react'

import * as queryString from 'query-string'
import { useLocation } from 'react-router-dom'

export const OAuthLoginPage = () => {
  const { search } = useLocation()
  const { scope, api_key, state, redirect } = queryString.parse(search)
  return (
    <>
      OAuth!
      <ul>
        <li>Scope: {scope}</li>
        <li>Api key: {api_key}</li>
        <li>State: {state}</li>
        <li>Redirect URL: {redirect}</li>
      </ul>
    </>
  )
}
