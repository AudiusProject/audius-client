import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Status } from 'store/types'

export type ChangePasswordState = {
  confirmCredentials: {
    status?: Status
  }
  changePassword: {
    status?: Status
  }
  currentPage: Page
}

export enum Page {
  CONFIRM_CREDENTIALS = 0,
  NEW_PASSWORD = 1,
  LOADING = 2,
  SUCCESS = 3,
  FAILURE = 4
}

const initialState: ChangePasswordState = {
  confirmCredentials: {
    status: undefined
  },
  changePassword: {
    status: undefined
  },
  currentPage: Page.CONFIRM_CREDENTIALS
}

const slice = createSlice({
  name: 'application/ui/changePassword',
  initialState,
  reducers: {
    confirmCredentials: (
      state,
      _action: PayloadAction<{ email: string; password: string }>
    ) => {
      return {
        ...state,
        confirmCredentials: {
          status: Status.LOADING
        }
      }
    },
    confirmCredentialsSucceeded: state => {
      return {
        ...state,
        confirmCredentials: {
          status: Status.SUCCESS
        }
      }
    },
    confirmCredentialsFailed: state => {
      return {
        ...state,
        confirmCredentials: {
          status: Status.ERROR
        }
      }
    },
    changePassword: (
      state,
      _action: PayloadAction<{
        email: string
        password: string
        oldPassword: string
      }>
    ) => {
      return {
        ...state,
        changePassword: {
          status: Status.LOADING
        }
      }
    },
    changePasswordSucceeded: state => {
      return {
        ...state,
        changePassword: {
          status: Status.SUCCESS
        }
      }
    },
    changePasswordFailed: state => {
      return {
        ...state,
        changePassword: {
          status: Status.ERROR
        }
      }
    },
    changePage: (state, action: PayloadAction<Page>) => {
      return {
        ...state,
        currentPage: action.payload
      }
    }
  }
})

export const {
  confirmCredentials,
  confirmCredentialsSucceeded,
  confirmCredentialsFailed,
  changePassword,
  changePasswordSucceeded,
  changePasswordFailed,
  changePage
} = slice.actions

export default slice.reducer
