import moment from 'moment'
import TimeRange from 'models/TimeRange'

const LISTEN_MULTIPLER = 1
const WINDOWED_REPOST_MULTIPLER = 50
const WINDOWED_SAVE_MULTIPLIER = 1
const ALL_TIME_REPOST_MULTIPLER = 0.25
const ALL_TIME_SAVE_MULTIPLER = 0.01
const CREATED_AT_MULTIPLIER = 5.0
const TIME_RANGE_MAPPING = {
  [TimeRange.WEEK]: 7,
  [TimeRange.MONTH]: 30,
  [TimeRange.YEAR]: 365
}

type TrendingRecord = {
  created_at: string
  track_id: number
  listens: number
  repost_count: number
  windowed_repost_count: number
  save_count: number
  windowed_save_count: number
  track_owner_follower_count: number
}

const now = moment()

/**
 * Takes a trending record and returns a weighted sum that calculates its
 * `trending` score.
 * First, we calculate a score based on listens + reposts + saves (favorites).
 * Then we multiply that score by a multiplier given the following formula
 *  Piecewise[{ {1, x < TR}, { CAM ^ (1 - ( x / TR)), x >= TR }, { 1 / CAM, x > 2 * TR }}]
 *  where
 *    x = the number of days ago the track was createtd
 *    CAM = the created at multiplier (controls the rate of decay)
 *    TR = trending time range in days (e.g. 7 for 1 week)
 * This function has the nice property that the multipler is 1 w/in the time range
 * and decays from 1 to 0.2 over two time ranges but is clamped to between 1 and 0.2.
 */
export const getTrendingScore = (
  record: TrendingRecord,
  timeRange: TimeRange
): number => {
  // Less than 3 followers is likely a bot, just skip it
  if (record.track_owner_follower_count < 3) return 0

  const baseScore =
    LISTEN_MULTIPLER * record.listens +
    WINDOWED_REPOST_MULTIPLER * record.windowed_repost_count +
    WINDOWED_SAVE_MULTIPLIER * record.windowed_save_count +
    ALL_TIME_REPOST_MULTIPLER * record.repost_count +
    ALL_TIME_SAVE_MULTIPLER * record.save_count

  const createdAt = moment(record.created_at)
  const timeDifferenceDays = now.diff(createdAt, 'days')

  let multiplier
  if (timeDifferenceDays < TIME_RANGE_MAPPING[timeRange]) {
    // Tracks created at this time range have a multipler of 1
    multiplier = 1
  } else {
    // Tracks uploaded more than the time range ago decay from
    // 1 to 1 / CREATED_AT_MULTIPLIER (and bottom out at 1 / CREATED_AT_MULTIPLIER)
    multiplier = Math.max(
      1.0 / CREATED_AT_MULTIPLIER,
      // y = n ^ (1 - x / y) gives us a peak at n and exponential decay down to 0
      Math.pow(
        CREATED_AT_MULTIPLIER,
        1 - timeDifferenceDays / TIME_RANGE_MAPPING[timeRange]
      )
    )
  }

  return baseScore * multiplier
}

export const sortByTrendingScore = (timeRange: TimeRange) => (
  a: TrendingRecord,
  b: TrendingRecord
): number => {
  const scoreA = getTrendingScore(a, timeRange)
  const scoreB = getTrendingScore(b, timeRange)
  if (scoreA === scoreB) return b.track_id - a.track_id
  return scoreB - scoreA
}
