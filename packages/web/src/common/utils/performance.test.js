import { Timer } from './performance'

let sendToAnalytics
beforeEach(() => {
  sendToAnalytics = jest.fn()
})

afterEach(() => {
  global.Date.now = () => Date.now()
})

describe('single value', () => {
  it('records a metric', () => {
    const t = new Timer({ name: 'single_value' }, sendToAnalytics)

    global.Date.now = jest.fn(() => 0)

    const s = t.start()

    global.Date.now = jest.fn(() => 1000)

    t.end(s)

    expect(sendToAnalytics).toBeCalledWith({
      name: 'single_value',
      duration: 1000
    })
  })
})

describe('batches values', () => {
  it('records a metric', () => {
    const t = new Timer(
      { name: 'batched_value', batch: true, batchSize: 5 },
      sendToAnalytics
    )

    for (let i = 0; i < 5; ++i) {
      global.Date.now = jest.fn(() => 0)

      const s = t.start()

      global.Date.now = jest.fn(() => 1000)

      t.end(s)
    }

    expect(sendToAnalytics).toBeCalledWith({
      name: 'batched_value',
      duration: 1000
    })
  })

  it('does not record if the batch is too small', () => {
    const t = new Timer(
      { name: 'batched_value', batch: true, batchSize: 5 },
      sendToAnalytics
    )

    for (let i = 0; i < 4; ++i) {
      global.Date.now = jest.fn(() => 0)

      const s = t.start()

      global.Date.now = jest.fn(() => 1000)

      t.end(s)
    }

    expect(sendToAnalytics).not.toBeCalled()
  })

  it('records multiple batches', () => {
    const t = new Timer(
      { name: 'batched_value', batch: true, batchSize: 5 },
      sendToAnalytics
    )

    for (let i = 0; i < 17; ++i) {
      global.Date.now = jest.fn(() => 0)

      const s = t.start()

      global.Date.now = jest.fn(() => 1000)

      t.end(s)
    }

    expect(sendToAnalytics).toBeCalledTimes(3)
  })
})
