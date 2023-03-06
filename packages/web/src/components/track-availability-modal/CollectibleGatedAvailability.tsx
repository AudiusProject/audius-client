import { useMemo } from 'react'

import {
  Chain,
  collectiblesSelectors,
  TrackAvailabilityType
} from '@audius/common'
import { useSelector } from 'react-redux'

import DropdownInput from 'components/data-entry/DropdownInput'

import styles from './CollectibleGatedAvailability.module.css'
import { TrackAvailabilitySelectionProps } from './types'

const { getSupportedUserCollections } = collectiblesSelectors

const messages = {
  pickACollection: 'Pick a Collection'
}

export const CollectibleGatedAvailability = ({
  state,
  onStateUpdate
}: TrackAvailabilitySelectionProps) => {
  const { ethCollectionMap, solCollectionMap } = useSelector(
    getSupportedUserCollections
  )

  const ethCollectibleItems = useMemo(() => {
    return Object.keys(ethCollectionMap)
      .sort((s1, s2) =>
        ethCollectionMap[s1].name.localeCompare(ethCollectionMap[s2].name)
      )
      .map((slug) => ({
        text: ethCollectionMap[slug].name,
        el: (
          <div className={styles.dropdownRow}>
            {!!ethCollectionMap[slug].img && (
              <img
                src={ethCollectionMap[slug].img!}
                alt={ethCollectionMap[slug].name}
              />
            )}
            <span>{ethCollectionMap[slug].name}</span>
          </div>
        ),
        value: slug
      }))
  }, [ethCollectionMap])

  const solCollectibleItems = useMemo(() => {
    return Object.keys(solCollectionMap)
      .sort((m1, m2) =>
        solCollectionMap[m1].name.localeCompare(solCollectionMap[m2].name)
      )
      .map((mint) => ({
        text: solCollectionMap[mint].name,
        el: (
          <div className={styles.dropdownRow}>
            {!!solCollectionMap[mint].img && (
              <img
                src={solCollectionMap[mint].img!}
                alt={solCollectionMap[mint].name}
              />
            )}
            <span>{solCollectionMap[mint].name}</span>
          </div>
        ),
        value: mint
      }))
  }, [solCollectionMap])

  const menuItems = useMemo(
    () => [...ethCollectibleItems, ...solCollectibleItems],
    [ethCollectibleItems, solCollectibleItems]
  )

  return (
    <div className={styles.root}>
      <DropdownInput
        aria-label={messages.pickACollection}
        placeholder={messages.pickACollection}
        mount={null}
        popupContainer={(triggerNode: HTMLElement) =>
          // hack to escape the collapsible container which has overflow: hidden
          // maintains scrollability, unlike `mount={'page'}
          triggerNode.parentNode?.parentNode?.parentNode
        }
        menu={{ items: menuItems }}
        defaultValue={state.premium_conditions?.nft_collection?.name ?? ''}
        onSelect={(value: string) => {
          if (ethCollectionMap[value]) {
            onStateUpdate(
              {
                nft_collection: {
                  chain: Chain.Eth,
                  standard: ethCollectionMap[value].standard,
                  address: ethCollectionMap[value].address,
                  name: ethCollectionMap[value].name,
                  imageUrl: ethCollectionMap[value].img,
                  externalLink: ethCollectionMap[value].externalLink,
                  slug: value
                }
              },
              TrackAvailabilityType.COLLECTIBLE_GATED
            )
          } else if (solCollectionMap[value]) {
            onStateUpdate(
              {
                nft_collection: {
                  chain: Chain.Sol,
                  address: value,
                  name: solCollectionMap[value].name,
                  imageUrl: solCollectionMap[value].img,
                  externalLink: solCollectionMap[value].externalLink
                }
              },
              TrackAvailabilityType.COLLECTIBLE_GATED
            )
          }
        }}
        size='large'
        dropdownStyle={styles.dropdown}
        dropdownInputStyle={styles.dropdownInput}
      />
    </div>
  )
}
