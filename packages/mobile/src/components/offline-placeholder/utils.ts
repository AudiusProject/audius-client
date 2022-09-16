export const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
// The maximum is exclusive and the minimum is inclusive
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}
