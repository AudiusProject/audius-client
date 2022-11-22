import React, {
  Suspense,
  Component,
  useMemo,
  ReactNode,
  useCallback,
  useState
} from 'react'

import {
  ID,
  Status,
  Theme,
  Track,
  User,
  formatCount,
  themeSelectors
} from '@audius/common'
import { IconFilter, IconNote, IconHidden } from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { each } from 'lodash'
import moment, { Moment } from 'moment'
import { connect, useDispatch, useSelector } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Dispatch } from 'redux'

import Header from 'components/header/desktop/Header'
import { Input } from 'components/input'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Page from 'components/page/Page'
import { TracksTable, TracksTableColumn } from 'components/tracks-table'
import useTabs, { useTabRecalculator } from 'hooks/useTabs/useTabs'
import { AppState } from 'store/types'
import lazyWithPreload from 'utils/lazyWithPreload'
import { profilePage, TRENDING_PAGE } from 'utils/route'
import { withClassNullGuard } from 'utils/withNullGuard'

import styles from './QueuePage.module.css'


export const QueuePage = (props: { }) => {
  const header = <Header primary='Queue' />
  return (
      <Page
        title='Dashboard'
        description='View important stats like plays, reposts, and more.'
        contentClassName={styles.pageContainer}
        header={header}
      >
      </Page>
    )
  }

const mapStateToProps = (state: AppState) => {
  return {
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
})

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(QueuePage)
)
