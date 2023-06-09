import {
  forwardRef,
  useRef,
  useCallback,
  useEffect,
  ComponentPropsWithoutRef
} from 'react'

import cn from 'classnames'
import { mergeRefs } from 'react-merge-refs'

import styles from './TextAreaV2.module.css'
import { useFocusState } from './useFocusState'

export enum TextAreaSize {
  MEDIUM,
  SMALL
}

const sizeToLineHeight: Record<TextAreaSize, number> = {
  [TextAreaSize.MEDIUM]: 24,
  [TextAreaSize.SMALL]: 18
}

const sizeToVerticalPadding: Record<TextAreaSize, number> = {
  [TextAreaSize.MEDIUM]: 16,
  [TextAreaSize.SMALL]: 12
}

const getMaxHeight = ({
  maxVisibleRows,
  size
}: {
  maxVisibleRows?: number
  size: TextAreaSize
}) =>
  maxVisibleRows !== undefined
    ? maxVisibleRows * sizeToLineHeight[size] + sizeToVerticalPadding[size]
    : undefined

type TextAreaV2Props = ComponentPropsWithoutRef<'textarea'> & {
  grows?: boolean
  resize?: boolean
  size?: TextAreaSize
  heightBuffer?: number
  maxVisibleRows?: number
  showMaxLength?: boolean
}

const CHARACTER_LIMIT_WARN_THRESHOLD_PERCENT = 0.875

export const TextAreaV2 = forwardRef<HTMLTextAreaElement, TextAreaV2Props>(
  (props, forwardedRef) => {
    const {
      resize = false,
      grows = false,
      size = TextAreaSize.MEDIUM,
      heightBuffer,
      maxVisibleRows,
      maxLength,
      showMaxLength,
      className,
      value,
      children,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...other
    } = props

    const rootRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const characterCount = value ? `${value}`.length : 0
    const nearCharacterLimit =
      maxLength &&
      characterCount > CHARACTER_LIMIT_WARN_THRESHOLD_PERCENT * maxLength

    const maxHeight = grows
      ? getMaxHeight({ maxVisibleRows, size })
      : rootRef.current?.offsetHeight // clamp to initial height if non-growing

    const style = {
      [styles.noResize]: !resize,
      [styles.medium]: size === TextAreaSize.MEDIUM,
      [styles.small]: size === TextAreaSize.SMALL
    }

    const growTextArea = useCallback(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'inherit'
        textarea.style.height = `${
          textarea.scrollHeight + (heightBuffer ?? 0)
        }px`
        rootRef.current?.scrollTo({ top: rootRef.current?.scrollHeight })
      }
    }, [textareaRef, heightBuffer])

    /**
     * Since Firefox doesn't support the :has() pseudo selector,
     * manually track the focused state and use classes for focus
     */
    const [isFocused, handleFocus, handleBlur] =
      useFocusState<HTMLTextAreaElement>(onFocusProp, onBlurProp)

    useEffect(() => {
      // Even though we always "grow" the text area,
      // the maxHeight of the container will cause a scrollbar to appear if necesary
      growTextArea()
    }, [growTextArea, value])

    return (
      <div
        ref={rootRef}
        className={cn(
          styles.root,
          { [styles.focused]: isFocused },
          style,
          className
        )}
        style={{ maxHeight }}
      >
        <textarea
          ref={mergeRefs([textareaRef, forwardedRef])}
          maxLength={maxLength ?? undefined}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...other}
        />
        <div className={styles.bottom}>
          <div className={styles.bottomRight}>
            <div
              className={styles.children}
              style={{ height: `${sizeToLineHeight[size]}px` }}
            >
              {children}
            </div>
            {showMaxLength ? (
              <div
                className={cn(styles.characterCount, {
                  [styles.nearLimit]: nearCharacterLimit
                })}
              >
                {characterCount}/{maxLength}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
)
