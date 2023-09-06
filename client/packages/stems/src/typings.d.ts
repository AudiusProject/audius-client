/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.svg' {
  const svgUrl: string
  const svgComponent: React.ComponentType<SvgProps>
  export default svgUrl
  export { svgComponent as ReactComponent }
}

declare module 'storybook-addon-smart-knobs'
