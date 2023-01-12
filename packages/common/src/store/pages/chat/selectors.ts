import { CommonState } from 'store/reducers'

export const getChatsSummary = (state: CommonState) =>
  state.pages.chat.chatList.summary

export const getChat = (state: CommonState, chatId?: string) =>
  chatId
    ? state.pages.chat.chatList.data?.find((chat) => chat.chat_id === chatId)
    : undefined

export const getChats = (state: CommonState) => state.pages.chat.chatList.data

export const getChatsResponse = (state: CommonState) =>
  state.pages.chat.chatList

export const getChatMessagesSummary = (state: CommonState, chatId: string) =>
  state.pages.chat.chatMessages[chatId].summary

export const getChatMessages = (state: CommonState, chatId: string) =>
  state.pages.chat.chatMessages[chatId]?.data
