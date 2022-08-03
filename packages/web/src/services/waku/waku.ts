import { Waku } from 'js-waku'

export const initWaku = async (setter: (waku: Waku) => void) => {
  try {
    const waku = await Waku.create({
      libp2p: {
        config: {
          pubsub: {
            enabled: true,
            emitSelf: true
          }
        }
      },
      bootstrap: {
        peers: [
          // '/dns4/isaac-waku.audius.co/tcp/8000/ws/p2p/16Uiu2HAm5WQ6CdaqtSBoPPpxeNkb5bPVWXeW3iMvEuVdTAWAtJba',
          // '/dns4/hareesh-waku.audius.co/tcp/8000/ws/p2p/16Uiu2HAmCyh1NtKeWyKapKxQ5jB7syr6myh7D2KtG7HNuRxbUs4v',
          '/dns4/joe-waku.audius.co/tcp/8000/ws/p2p/16Uiu2HAmBFzip5j4TvECok3oFZ1dvJyDbWgUXSd1fHSS89iVTZbW'
          // '/dns4/waku.audius2.stereosteve.com/tcp/8000/ws/p2p/16Uiu2HAmQDYtHQDWHzTrDu8uv5kYoZ1f8pvpUq1p8A2hieS3fnNn'
        ]
      }
    })

    setter(waku)
  } catch (e) {
    console.log('Waku |Issue starting waku ', e)
  }
}
