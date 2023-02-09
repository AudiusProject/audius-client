/** Logs given input to console if we're not in a production environment. */
export const logError = (...args) => {
  if (process.env.PREACT_APP_ENVIRONMENT !== 'production') {
    console.error(args)
  }
  // TODO: Add Sentry logging
}
