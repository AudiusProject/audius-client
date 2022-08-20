import { useRef, useState, useCallback, useEffect } from 'react'

const switchControlledError = ({
  isControlled,
  stateName,
  componentName
}: {
  isControlled: boolean
  stateName: string
  componentName: string
}) => {
  return [
    `Audius Stems: A component is changing an ${
      isControlled ? '' : 'un'
    }controlled ${stateName} state of ${componentName} to be ${
      isControlled ? 'un' : ''
    }controlled.`,
    'This is likely caused by the value changing from undefined to a defined value, which should not happen.',
    'Decide between using a controlled or uncontrolled input element for the lifetime of the component.',
    "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
    'More info: https://fb.me/react-controlled-components'
  ].join('\n')
}

const defaultChangedError = ({
  stateName,
  componentName
}: {
  stateName: string
  componentName: string
}) => {
  return (
    `Audius Stems: A component is changing the default ${stateName} state of an uncontrolled ${componentName} after being initialized. ` +
    `To suppress this warning opt to use a controlled ${componentName}.`
  )
}

export const useControlled = <T extends string | number | undefined | null>({
  controlledProp,
  defaultValue,
  stateName = 'value',
  componentName
}: {
  controlledProp: T
  defaultValue: T
  stateName?: string
  componentName: string
}): [T, (newValue: T) => void] => {
  // Save a ref of the initial isControlled state
  const { current: isControlled } = useRef(controlledProp !== undefined)

  // Local state for use with uncontrolled components
  const [valueState, setValueState] = useState(defaultValue)

  // If the component is controlled, use the controlled prop rather than the local state
  const value = isControlled ? controlledProp : valueState

  // If the component is uncontrolled, this callback can be used to set the value
  const setValueIfUncontrolled = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setValueState(newValue)
      }
    },
    [isControlled]
  )

  // Note each hook in this block has disabled react-hooks/rules-of-hooks
  // The code won't fork here at runtime, you'll either be in production or you won't.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    // Check if the component is switching from controlled to uncontrolled or vice-versa
    useEffect(() => {
      if (isControlled !== (controlledProp !== undefined)) {
        console.error(
          switchControlledError({ isControlled, stateName, componentName })
        )
      }
    }, [componentName, controlledProp, isControlled, stateName])

    // Check if the default value of an uncontrolled prop is being changed after initialization
    const { current: initialDefaultValue } = useRef(defaultValue)
    useEffect(() => {
      if (!isControlled && defaultValue !== initialDefaultValue) {
        console.error(defaultChangedError({ stateName, componentName }))
      }
    }, [
      componentName,
      defaultValue,
      initialDefaultValue,
      isControlled,
      stateName
    ])
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  return [value, setValueIfUncontrolled]
}
