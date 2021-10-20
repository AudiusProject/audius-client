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
    confirmCredentialsCompleted: (
      state,
      action: PayloadAction<{ success: boolean }>
    ) => {
      return {
        ...state,
        confirmCredentials: {
          status: action.payload.success ? Status.SUCCESS : Status.ERROR
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
    changePasswordCompleted: (
      state,
      action: PayloadAction<{ success: boolean }>
    ) => {
      return {
        ...state,
        changePassword: {
          status: action.payload.success ? Status.SUCCESS : Status.ERROR
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
  confirmCredentialsCompleted,
  changePassword,
  changePasswordCompleted,
  changePage
} = slice.actions

export default slice.reducer
