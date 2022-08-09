const aaoErrorEmojis = ['😓', '😭', '😥', '😮', '🤬', '😷', '😿', '😤', '🤨']

/**
 * Currently we have 7 error codes, please see this link:
 * https://www.notion.so/audiusproject/77229a671b564d97a7426ed98fe3c928?v=1b434faf2f7c4de19ea20f2d6c73ea9b
 *
 * Error code mappings:
 * Negative numbers are unexpected but valid, return last emoji.
 * Positive numbers are expected, return emoji at index of error code.
 * Positive numbers larger than number of error codes are invalid, ignore.
 **/
export const getAAOErrorEmojis = (errorCode: number): string => {
  return aaoErrorEmojis[errorCode] ?? aaoErrorEmojis[aaoErrorEmojis.length - 1]
}
