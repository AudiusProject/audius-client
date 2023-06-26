import React from 'react'

type IconProps = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
} & React.SVGProps<SVGSVGElement>

/** Renders a stems Icon component with optional decorator
 * Ex: `<Icon icon={IconKebabHorizontal}  />`
 */
export const Icon = ({ icon: IconComponent, ...iconProps }: IconProps) => {
  return <IconComponent {...iconProps} />
}
