import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
// import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const supportingForUser = [
  {
    receiver: {
      name: 'One Two',
      handle: 'onetwo',
      user_id: 38698,
      _profile_picture_sizes: {
        '150x150':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/150x150.jpg',
        '480x480':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/480x480.jpg',
        '1000x1000':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/1000x1000.jpg'
      },
      _cover_photo_sizes: {
        '640x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/640x.jpg',
        '2000x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/2000x.jpg'
      }
    },
    amount: 5,
    rank: 1,
    updated_at: 'yesterday'
  },
  {
    receiver: {
      name: 'Three Four',
      handle: 'three_four',
      user_id: 1,
      _profile_picture_sizes: {
        '150x150':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/150x150.jpg',
        '480x480':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/480x480.jpg',
        '1000x1000':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/1000x1000.jpg'
      },
      _cover_photo_sizes: {
        '640x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/640x.jpg',
        '2000x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/2000x.jpg'
      },
      is_verified: true
    },
    amount: 4,
    rank: 10,
    updated_at: 'today'
  },
  {
    receiver: {
      name: 'Five Six',
      handle: 'five6',
      user_id: 6,
      _profile_picture_sizes: {
        '150x150':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/150x150.jpg',
        '480x480':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/480x480.jpg',
        '1000x1000':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/1000x1000.jpg'
      },
      _cover_photo_sizes: {
        '640x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/640x.jpg',
        '2000x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/2000x.jpg'
      }
    },
    amount: 2,
    rank: 3,
    updated_at: 'today'
  },
  {
    receiver: {
      name: 'Seven Eight',
      handle: 'seveneight',
      user_id: 2,
      _profile_picture_sizes: {
        '150x150':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/150x150.jpg',
        '480x480':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/480x480.jpg',
        '1000x1000':
          'https://creatornode5.staging.audius.co/ipfs/QmTCgXVmezUW3pTRgiWvYLBe2TA6FwFZn8Y56Unq1mmLDC/1000x1000.jpg'
      },
      _cover_photo_sizes: {
        '640x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/640x.jpg',
        '2000x':
          'https://creatornode5.staging.audius.co/ipfs/QmUtYDKbUmhnRnNLpRStsZ7biSaAuFviGkiLHkUftHiysw/2000x.jpg'
      }
    },
    amount: 1,
    rank: 4,
    updated_at: 'last week'
  }
]
const supportersForUser = supportingForUser.map(s => {
  const ss = {
    ...s,
    sender: { ...s.receiver },
    receiver: undefined
  }
  return ss
})

const LIMIT = 25

// @ts-ignore
// const libs = () => window.audiusLibs

type SupportRequest = {
  userId: ID
  limit?: number
  offset?: number
}
export const fetchSupporting = async ({
  userId,
  limit = LIMIT,
  offset = 0
}: SupportRequest): Promise<Supporting[]> => {
  try {
    return supportingForUser as Supporting[]
    // await waitForLibsInit()
    // const response: Supporting[] = await libs().discoveryProvider.getSupporting({
    //   userId,
    //   limit,
    //   offset
    // })
    // return response
  } catch (e) {
    console.error(
      `Could not fetch supporting for user id ${userId}: ${
        (e as Error).message
      }`
    )
    return []
  }
}

export const fetchSupporters = async ({
  userId,
  limit = LIMIT,
  offset = 0
}: SupportRequest): Promise<Supporter[]> => {
  try {
    return supportersForUser as any[]
    // await waitForLibsInit()
    // const response: Supporter[] = await libs().discoveryProvider.getSupporters({
    //   userId,
    //   limit,
    //   offset
    // })
    // return response
  } catch (e) {
    console.error(
      `Could not fetch supporters for user id ${userId}: ${
        (e as Error).message
      }`
    )
    return []
  }
}
