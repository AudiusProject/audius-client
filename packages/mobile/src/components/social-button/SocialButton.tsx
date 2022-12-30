import React, { useMemo } from 'react'

import type { ButtonProps } from 'app/components/core'
import { Button } from 'app/components/core'
import { makeStyles } from 'app/styles'

export type SocialButtonProps = ButtonProps

const useStyles = makeStyles(({ spacing }) => ({
  button: {
    padding: spacing(3),
    height: 64
  },
  text: {
    fontSize: 20
  },
  icon: {
    height: 20,
    width: 20,
    marginRight: 12
  }
}))

export const SocialButton = (props: SocialButtonProps) => {
  const styles = useStyles()
  const buttonStyles = useMemo(
    () => ({
      icon: [styles.icon, props.styles?.icon],
      button: [styles.button, props.styles?.button],
      root: props.styles?.root,
      text: [styles.text, props.styles?.text]
    }),
    [styles, props.styles]
  )

  return <Button iconPosition={'left'} {...props} styles={buttonStyles} />
}
