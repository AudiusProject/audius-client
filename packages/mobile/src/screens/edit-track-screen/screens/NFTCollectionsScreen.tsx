import { View } from 'react-native'
import { ListSelectionScreen } from "./ListSelectionScreen"
import IconImage from 'app/assets/images/iconImage.svg'
import { useField } from "formik"
import { Nullable, PremiumConditions, Chain, EthCollectionMap, SolCollectionMap, accountSelectors, collectiblesSelectors, CommonState, Collectible } from "@audius/common"
import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Image } from 'react-native'
import { makeStyles } from 'app/styles'
import { Text } from 'app/components/core'

const messages = {
  collections: 'COLLECTIONS',
  searchCollections: 'Search Collections'
}

const { getUserId } = accountSelectors
const { getUserCollectibles, getSolCollections } = collectiblesSelectors

const defaultCollectibles = { [Chain.Eth]: [], [Chain.Sol]: [] }

const useStyles = makeStyles(({ spacing, palette, type }) => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  logo: {
    marginRight: spacing(3),
    borderWidth: 1,
    borderColor: palette.neutralLight8,
    borderRadius: spacing(1),
    width: spacing(8),
    height: spacing(8),
  }
}))

export const NFTCollectionsScreen = () => {
  const styles = useStyles()
  const [{ value: premiumConditions }, , { setValue: setPremiumConditions }] =
    useField<Nullable<PremiumConditions>>('premium_conditions')
  const accountUserId = useSelector(getUserId)
  const collectibles =
    useSelector((state: CommonState) => {
      if (!accountUserId) return defaultCollectibles
      return getUserCollectibles(state, { id: accountUserId })
    }) ?? defaultCollectibles
  const solCollections = useSelector(getSolCollections)

  // Ethereum collections
  const ethCollectionMap: EthCollectionMap = useMemo(() => {
    const map: EthCollectionMap = {}

    collectibles[Chain.Eth].forEach((collectible) => {
      const {
        collectionSlug,
        collectionName,
        collectionImageUrl,
        assetContractAddress,
        standard,
        externalLink
      } = collectible
      if (
        !collectionName ||
        !collectionSlug ||
        !assetContractAddress ||
        !standard ||
        map[collectionSlug]
      ) {
        return
      }
      map[collectionSlug] = {
        name: collectionName,
        img: collectionImageUrl,
        address: assetContractAddress,
        standard,
        externalLink
      }
    })

    return map
  }, [collectibles])

  const ethCollectibleItems = useMemo(() => {
    return Object.keys(ethCollectionMap)
      .sort((s1, s2) =>
        ethCollectionMap[s1].name.localeCompare(ethCollectionMap[s2].name)
      )
      .map((slug) => ({
        label: ethCollectionMap[slug].name,
        value: slug
      }))
  }, [ethCollectionMap])

  // Solana collections
  const solCollectionMap: SolCollectionMap = useMemo(() => {
    const map: SolCollectionMap = {}

    const validSolCollectionMints = [
      ...new Set(
        (collectibles[Chain.Sol] ?? [])
          .filter(
            (collectible: Collectible) =>
              !!collectible.solanaChainMetadata?.collection?.verified
          )
          .map((collectible: Collectible) => {
            const key = collectible.solanaChainMetadata!.collection!.key
            return typeof key === 'string' ? key : key.toBase58()
          })
      )
    ]
    validSolCollectionMints.forEach((mint) => {
      const { data, imageUrl } = solCollections[mint] ?? {}
      if (!data?.name || map[data.name]) return
      map[mint] = {
        name: data.name.replaceAll('\x00', ''),
        img: imageUrl ?? null,
        externalLink: null
      }
    })

    return map
  }, [collectibles, solCollections])

  // All collections images
  const collectionImageMap = useMemo(() => {
    const map: { [address: string]: string } = {}

    Object.keys(ethCollectionMap)
      .forEach(slug => {
        if (!!ethCollectionMap[slug].img) {
          map[slug] = ethCollectionMap[slug].img!
        }
      })
    Object.keys(solCollectionMap)
      .forEach(mint => {
        if (!!solCollectionMap[mint].img) {
          map[mint] = solCollectionMap[mint].img!
        }
      })

    return map
  }, [ethCollectionMap, solCollectionMap])

  const solCollectibleItems = useMemo(() => {
    return Object.keys(solCollectionMap)
      .sort((m1, m2) =>
        solCollectionMap[m1].name.localeCompare(solCollectionMap[m2].name)
      )
      .map((mint) => ({
        label: solCollectionMap[mint].name,
        value: mint
      }))
  }, [solCollectionMap])

  const data = useMemo(
    () => [...ethCollectibleItems, ...solCollectibleItems],
    [ethCollectibleItems, solCollectibleItems]
  )

  const renderItem = (({ item }) => {
    const { label: name, value: identifier } = item
    const imageUrl = collectionImageMap[identifier]
    return (
      <View style={styles.item}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.logo} />
        )}
        <Text weight='demiBold' fontSize='large'>
          {name}
        </Text>
      </View>
    )
  })

  const value = useMemo(() => {
    if (Chain.Eth === premiumConditions?.nft_collection?.chain) {
      return premiumConditions.nft_collection.slug
    }
    if (Chain.Sol === premiumConditions?.nft_collection?.chain) {
      return premiumConditions.nft_collection.address
    }
    return ''
  }, [premiumConditions])

  const handleChange = useCallback((value: string) => {
    if (ethCollectionMap[value]) {
      setPremiumConditions({
        nft_collection: {
          chain: Chain.Eth,
          standard: ethCollectionMap[value].standard,
          address: ethCollectionMap[value].address,
          name: ethCollectionMap[value].name,
          imageUrl: ethCollectionMap[value].img,
          externalLink: ethCollectionMap[value].externalLink,
          slug: value
        }
      })
    } else if (solCollectionMap[value]) {
      setPremiumConditions({
        nft_collection: {
          chain: Chain.Sol,
          address: value,
          name: solCollectionMap[value].name,
          imageUrl: solCollectionMap[value].img,
          externalLink: solCollectionMap[value].externalLink
        }
      })
    }
  }, [])

  return (
    <ListSelectionScreen
      data={data}
      renderItem={renderItem}
      screenTitle={messages.collections}
      icon={IconImage}
      value={value}
      onChange={handleChange}
      searchText={messages.searchCollections}
      disableReset
    />
  )
}
