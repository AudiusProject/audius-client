import { PayloadAction } from '@reduxjs/toolkit'

type ToastContent = string | JSX.Element

export type ToastType = 'info' | 'error'

export type Toast = {
  content: ToastContent
  link?: string
  linkConfig?: Record<string, unknown>
  linkText?: string
  type?: ToastType
  key: string
  timeout?: number | 'MANUAL'
}

export type ToastState = {
  toasts: Toast[]
}

export type ToastAction = PayloadAction<{
  content: ToastContent
  link?: string
  linkText?: string
  type?: ToastType
  timeout?: number
}>
export type AddToastAction = PayloadAction<Toast>
export type DissmissToastAction = PayloadAction<{ key: string }>
export type ManualClearToastAction = PayloadAction<{ key: string }>
