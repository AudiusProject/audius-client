import path from 'path'
import fs from 'fs'

const APP_DIR = __dirname
const ACCOUNT_CREDENTIALS_FILE = `${APP_DIR}/.account-credentials.json`

export const exportAccount = (email, password, entropy) => {
  const json = JSON.stringify({
    email,
    password,
    entropy
  })
  fs.writeFileSync(ACCOUNT_CREDENTIALS_FILE, json)
}

export const importAccount = () => {
  try {
    const account = fs.readFileSync(ACCOUNT_CREDENTIALS_FILE)
    return JSON.parse(account)
  } catch (e) {
    return null
  }
}

export const clearAccount = () => {
  try {
    fs.unlinkSync(ACCOUNT_CREDENTIALS_FILE)
  } catch (e) {
    // Swallow the error -- probalby means the file didn't exist
  }
}
