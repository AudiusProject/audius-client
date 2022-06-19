import { useRef } from 'react'

import { Parallax } from 'react-scroll-parallax'
import { useSpring, animated } from 'react-spring'

import artist3lau from 'assets/img/publicSite/ImgArtist3LAU.jpg'
import artistAlinaBaraz from 'assets/img/publicSite/ImgArtistAlinaBaraz.jpg'
import artistDeadmau5 from 'assets/img/publicSite/ImgArtistDeadmau5.jpg'
import artistJasonDerulo from 'assets/img/publicSite/ImgArtistJasonDerulo.jpg'
import artistKatyPerry from 'assets/img/publicSite/ImgArtistKatyPerry.jpg'
import artistNas from 'assets/img/publicSite/ImgArtistNas.jpg'
import artistRezz from 'assets/img/publicSite/ImgArtistREZZ.jpg'
import artistSkrillex from 'assets/img/publicSite/ImgArtistSkrillex.jpg'
import artistSteveAoki from 'assets/img/publicSite/ImgArtistSteveAoki.jpg'
import artistChainsmokers from 'assets/img/publicSite/ImgArtistTheChainsmokers.jpg'
import dots2x from 'assets/img/publicSite/dots@2x.jpg'
import useCardWeight from 'hooks/useCardWeight'
import useHasViewed from 'hooks/useHasViewed'

import styles from './ArtistTestimonials.module.css'

const messages = {
  title: 'Built With The Best',
  subtitle: 'We designed it with you in mind and with them by our side.'
}

type AristProps = {
  imageUrl: string
  name: string
  setSelectedIndex: () => void
  containerRef: any
}

const Artist = (props: AristProps) => {
  const [cardRef, onMove, onLeave, transform] = useCardWeight({
    sensitivity: 5
  })

  return (
    <div
      className={styles.cardMoveContainer}
      ref={props.containerRef}
      onMouseMove={onMove}
      onMouseEnter={props.setSelectedIndex}
      onMouseLeave={onLeave}
    >
      <div ref={cardRef} className={styles.artistContainer}>
        <animated.img
          src={props.imageUrl}
          className={styles.artistImage}
          style={{
            transform
          }}
        />
        <div className={styles.artistName}>{props.name}</div>
      </div>
    </div>
  )
}

type MobileArtistProps = {
  imageUrl: string
  name: string
}
const MobileArtist = (props: MobileArtistProps) => {
  return (
    <div className={styles.artistCard}>
      <img
        src={props.imageUrl}
        className={styles.artistImage}
        alt='Audius Artist'
      />
      <div className={styles.artistName}>{props.name}</div>
    </div>
  )
}

const artists = [
  {
    name: 'deadmau5',
    imageUrl: artistDeadmau5
  },
  {
    name: 'Katy Perry',
    imageUrl: artistKatyPerry
  },
  {
    name: 'Nas',
    imageUrl: artistNas
  },
  {
    name: 'Jason Derulo',
    imageUrl: artistJasonDerulo
  },
  {
    name: 'Steve Aoki',
    imageUrl: artistSteveAoki
  },
  {
    name: 'SKRILLEX',
    imageUrl: artistSkrillex
  },
  {
    name: 'REZZ',
    imageUrl: artistRezz
  },
  {
    name: 'The Chainsmokers',
    imageUrl: artistChainsmokers
  },
  {
    name: 'alina baraz',
    imageUrl: artistAlinaBaraz
  },
  {
    name: '3LAU',
    imageUrl: artist3lau
  }
]

type ArtistTestimonialsProps = {
  isMobile: boolean
}

// Update the selected artist every TRANSITION_ARTIST_INTERVAL msec
// const TRANSITION_ARTIST_INTERVAL = 5 * 1000

const ArtistTestimonials = (props: ArtistTestimonialsProps) => {
  const offset = useRef(0)
  const artistCards = useRef<Array<HTMLElement | null>>(
    Array.from({ length: artists.length }, () => null)
  )

  const setAristsRef = (index: number) => (node: HTMLDivElement) => {
    if (node !== null) {
      artistCards.current[index] = node
      if (index === 0) {
        const { width } = (node as HTMLElement).getBoundingClientRect()
        const offsetX = (node as HTMLElement).offsetLeft
        offset.current = offsetX + width / 2
      }
    }
  }

  // Animate in the title and subtitle text
  const [hasViewed, refInView] = useHasViewed()
  // @ts-ignore
  const titleStyles = useSpring({
    config: { mass: 3, tension: 2000, friction: 500 },
    opacity: hasViewed ? 1 : 0,
    x: hasViewed ? 0 : 120
  })

  if (props.isMobile) {
    // The mobile quote should be the deadmau5 quote

    return (
      <div className={styles.mobileContainer}>
        <div
          className={styles.dotsBackground}
          style={{ backgroundImage: `url(${dots2x})` }}
        ></div>
        <h3 className={styles.title}>{messages.title}</h3>
        <h3 className={styles.subTitle}>{messages.subtitle}</h3>
        <div className={styles.artistsContainer}>
          {artists.reverse().map(artist => (
            <MobileArtist key={artist.name} {...artist} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div ref={refInView} className={styles.content}>
        <div className={styles.foreground}>
          <div className={styles.animateTitleContainer}>
            <animated.div
              style={{
                opacity: titleStyles.opacity,
                // @ts-ignore
                transform: titleStyles.x.interpolate(
                  x => `translate3d(0,${x}px,0)`
                ),
                width: '100%'
              }}
            >
              <h3 className={styles.title}>{messages.title}</h3>
              <h3 className={styles.subTitle}>{messages.subtitle}</h3>
            </animated.div>
          </div>
          <div className={styles.artistsContainer}>
            {artists.map((artist, idx) => (
              <Artist
                key={artist.name}
                {...artist}
                containerRef={setAristsRef(idx)}
                setSelectedIndex={() => {
                  // setSelectedIndex(idx)
                }}
              />
            ))}
          </div>
        </div>
        <Parallax
          y={[-15, 30]}
          styleInner={{
            position: 'absolute',
            top: '-70px',
            height: '100%'
          }}
        >
          <div
            className={styles.dotsBackground}
            style={{ backgroundImage: `url(${dots2x})` }}
          ></div>
        </Parallax>
      </div>
    </div>
  )
}

export default ArtistTestimonials
