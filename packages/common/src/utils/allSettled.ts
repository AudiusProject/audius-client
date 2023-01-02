export const allSettled =
  Promise.allSettled ||
  ((promises: any[]) =>
    Promise.all(
      promises.map((p: Promise<any>) =>
        p
          .then((value: any) => ({
            status: 'fulfilled',
            value
          }))
          .catch((reason: any) => ({
            status: 'rejected',
            reason
          }))
      )
    ))
