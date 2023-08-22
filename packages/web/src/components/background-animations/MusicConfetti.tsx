import { useRef, useState, useEffect, useCallback } from 'react'

import Confetti from 'utils/animations/music-confetti'
import { useOnResizeEffect } from 'utils/effects'

const PATHS = [
  // Heart
  new Path2D(
    'M4.8294,0 C1.83702857,0 0,2.65379464 0,4.61012277 C0,8.84082589 5.27554286,12.500625 9,15 C12.7244571,12.4996875 18,8.84082589 18,4.61012277 C18,2.65363058 16.1638457,0 13.1706,0 C11.4991714,0 10.0707429,1.21490625 9,2.36835938 C7.92822857,1.21478906 6.50088,0 4.8294,0 Z'
  ),
  // Listens
  new Path2D(
    'M9.01215343,0 C4.03768506,0 0,4.14271233 0,9.24657534 L0,13.9315068 C0.0244073147,16.175737 1.82684761,18 4.013172,18 L4.54169274,18 C4.997924,18 5.38282706,17.6050849 5.38282706,17.1369863 L5.38282706,10.6027397 C5.38282706,10.1346411 4.997924,9.73972603 4.54169274,9.73972603 L4.013172,9.73972603 C3.14762075,9.73972603 2.33090336,10.0354192 1.65780365,10.5285699 L1.65780365,9.24657534 C1.65780365,5.10386301 4.95000337,1.7260274 8.98768843,1.7260274 C13.0253735,1.7260274 16.3420863,5.10386301 16.3420863,9.24657534 L16.3420863,10.5285699 C15.6689866,10.0354192 14.8757248,9.73972603 13.9867179,9.73972603 L13.4581972,9.73972603 C13.0019659,9.73972603 12.6170629,10.1346411 12.6170629,10.6027397 L12.6170629,17.1369863 C12.6170629,17.6050849 13.0019659,18 13.4581972,18 L13.9867179,18 C16.1975073,18 17.9765785,16.175737 17.9998899,13.9315068 L17.9998899,9.24657534 C18.0242972,4.14271233 13.9867179,0 9.01224955,0 L9.01215343,0 Z'
  ),
  // Note
  new Path2D(
    'M3,13.0400072 L3,3.61346039 C3,3.16198653 3.28424981,2.76289841 3.70172501,2.62823505 L12.701725,0.0477059646 C13.3456556,-0.160004241 14,0.3365598 14,1.0329313 L14,12.9033651 C14,12.9179063 13.9997087,12.9323773 13.9991318,12.9467722 C13.9997094,12.9644586 14,12.9822021 14,13 C14,14.1045695 12.8807119,15 11.5,15 C10.1192881,15 9,14.1045695 9,13 C9,11.8954305 10.1192881,11 11.5,11 C11.6712329,11 11.838445,11.0137721 12,11.0400072 L12,3.61346039 L5,5.5488572 L5,14.9677884 C5,14.9726204 4.99996783,14.9774447 4.99990371,14.9822611 C4.99996786,14.988168 5,14.994081 5,15 C5,16.1045695 3.88071187,17 2.5,17 C1.11928813,17 0,16.1045695 0,15 C0,13.8954305 1.11928813,13 2.5,13 C2.67123292,13 2.83844503,13.0137721 3,13.0400072 Z'
  ),
  // Playlists
  new Path2D(
    'M5.46563786,16.9245466 C4.92388449,17.5744882 4.02157241,18 3,18 C1.34314575,18 0,16.8807119 0,15.5 C0,14.1192881 1.34314575,13 3,13 C3.35063542,13 3.68722107,13.0501285 4,13.1422548 L4,3.02055066 C4,2.49224061 4.31978104,2.02523181 4.78944063,1.86765013 L10.5394406,0.0558250276 C11.2638626,-0.187235311 12,0.393838806 12,1.20872555 C12,2.01398116 12,2.61792286 12,3.02055066 C12,3.62449236 11.4511634,4.01020322 11,4.12121212 C10.3508668,4.28093157 8.68420009,4.62436591 6,5.15151515 L6,16.0224658 C6,16.5009995 5.80514083,16.7960063 5.46563786,16.9245466 Z M13,6 L17,6 C17.5522847,6 18,6.44771525 18,7 C18,7.55228475 17.5522847,8 17,8 L13,8 C12.4477153,8 12,7.55228475 12,7 C12,6.44771525 12.4477153,6 13,6 Z M11,10 L17,10 C17.5522847,10 18,10.4477153 18,11 C18,11.5522847 17.5522847,12 17,12 L11,12 C10.4477153,12 10,11.5522847 10,11 C10,10.4477153 10.4477153,10 11,10 Z M11,14 L17,14 C17.5522847,14 18,14.4477153 18,15 C18,15.5522847 17.5522847,16 17,16 L11,16 C10.4477153,16 10,15.5522847 10,15 C10,14.4477153 10.4477153,14 11,14 Z'
  )
]

const COLORS = ['#cc0fe0', '#7e1bcc']

// const startConfettiAnimation = async (
//   canvasRef: HTMLCanvasElement,
//   recycle: boolean,
//   limit: number,
//   friction: number,
//   gravity: number,
//   rotate: number,
//   swing: number,
//   particleRate: number,
//   onCompletion?: () => void
// ) => {
//   if (!canvasRef) return

//   const confetti = new Confetti(
//     canvasRef,
//     PATHS,
//     COLORS,
//     recycle,
//     limit,
//     friction,
//     gravity,
//     rotate,
//     swing,
//     particleRate,
//     onCompletion
//   )
//   confetti.run()
//   return confetti
// }

type MusicConfettiProps = {
  withBackground?: boolean
  recycle?: boolean
  friction?: number
  gravity?: number
  limit?: number
  rotate?: number
  swing?: number
  particleRate?: number
  zIndex?: number
  onCompletion?: () => void
  isMatrix?: boolean
}

export const MusicConfetti = ({
  recycle,
  limit,
  friction,
  gravity,
  rotate,
  swing,
  particleRate,
  zIndex,
  withBackground,
  onCompletion,
  isMatrix
}: MusicConfettiProps) => {
  const confettiRef = useRef<Confetti | null>(null)

  // When we mount canvas, start confetti and set the confettiRef
  const setCanvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (!node) return

      const confetti = new Confetti(
        node,
        isMatrix ? undefined : PATHS,
        isMatrix ? undefined : COLORS,
        recycle || false,
        limit || 200,
        friction || 0.99,
        gravity || 0.2,
        isMatrix ? 0 : rotate || 0.1,
        isMatrix ? 0 : swing || 0.01,
        particleRate || 0.1,
        onCompletion
      )
      confetti.run()
      confettiRef.current = confetti
    },
    [
      recycle,
      limit,
      friction,
      gravity,
      rotate,
      swing,
      particleRate,
      onCompletion,
      isMatrix
    ]
  )

  const [sizing, setSize] = useState({})

  useEffect(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }, [])

  useOnResizeEffect(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
  })

  return (
    <canvas
      ref={setCanvasRef}
      {...sizing}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: zIndex || 16,
        width: '100vw',
        height: '100vh',
        ...(withBackground
          ? {
              background:
                'radial-gradient(circle at top left, #B749D6 0%, #6516A3 100%)'
            }
          : {})
      }}
    />
  )
}
