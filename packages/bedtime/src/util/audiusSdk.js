import { sdk } from '@audius/sdk'

let audiusSdk = null

const initAudiusSdk = () => {
  audiusSdk = sdk({ appName: 'Audius Bedtime Client' })
}

initAudiusSdk()

export { audiusSdk }
