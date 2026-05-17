import { forwardRef, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'

const NON_DIGIT_REGEX = /\D+/g
const ALLOWED_CONTROL_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'Enter',
])

function formatDigitsByThousands(rawValue: string) {
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function toDigits(value: string | number | null | undefined) {
  return String(value ?? '').replace(NON_DIGIT_REGEX, '')
}

function findCaretIndexByDigitCount(formattedValue: string, digitCount: number) {
  if (digitCount <= 0) {
    return 0
  }

  let seenDigits = 0

  for (let i = 0; i < formattedValue.length; i += 1) {
    if (/\d/.test(formattedValue[i])) {
      seenDigits += 1

      if (seenDigits === digitCount) {
        return i + 1
      }
    }
  }

  return formattedValue.length
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'>

export interface NumericGroupedInputProps extends InputProps {
  value: string | number
  onValueChange: (digits: string) => void
  minWidth?: number
  minValue?: number
  maxValue?: number
  validationMessage?: string
}

export const NumericGroupedInput = forwardRef<HTMLInputElement, NumericGroupedInputProps>(
  (
    {
      value,
      onValueChange,
      minWidth = 72,
      minValue,
      maxValue,
      validationMessage,
      className,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      onChange,
      placeholder = '0',
      ...inputProps
    },
    ref,
  ) => {
    const sizerRef = useRef<HTMLSpanElement>(null)
    const internalInputRef = useRef<HTMLInputElement>(null)
    const pendingCaretDigitCountRef = useRef<number | null>(null)
    const isComposingRef = useRef(false)
    const errorId = useId()
    const [inputWidth, setInputWidth] = useState(minWidth)

    const digitsValue = useMemo(() => toDigits(value), [value])
    const formattedValue = useMemo(() => formatDigitsByThousands(digitsValue), [digitsValue])
    const numericValue = digitsValue ? Number(digitsValue) : null
    const isBelowMin = numericValue !== null && minValue !== undefined && numericValue < minValue
    const isAboveMax = numericValue !== null && maxValue !== undefined && numericValue > maxValue
    const validationError = useMemo(() => {
      if (!isBelowMin && !isAboveMax) {
        return ''
      }

      if (validationMessage) {
        return validationMessage
      }

      if (isBelowMin) {
        return `Value should be at least ${formatDigitsByThousands(String(minValue))}.`
      }

      return `Value should be at most ${formatDigitsByThousands(String(maxValue))}.`
    }, [isBelowMin, isAboveMax, maxValue, minValue, validationMessage])

    useLayoutEffect(() => {
      if (!sizerRef.current) {
        return
      }

      const textWidth = Math.ceil(sizerRef.current.getBoundingClientRect().width)
      const horizontalChrome = 22

      setInputWidth(Math.max(minWidth, textWidth + horizontalChrome))
    }, [formattedValue, minWidth, placeholder])

    useLayoutEffect(() => {
      if (pendingCaretDigitCountRef.current === null || !internalInputRef.current) {
        return
      }

      const caretIndex = findCaretIndexByDigitCount(formattedValue, pendingCaretDigitCountRef.current)
      internalInputRef.current.setSelectionRange(caretIndex, caretIndex)
      pendingCaretDigitCountRef.current = null
    }, [formattedValue])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isComposingRef.current) {
        onKeyDown?.(event)
        return
      }

      if (!event.ctrlKey && !event.metaKey && event.key.length === 1 && !/\d/.test(event.key)) {
        event.preventDefault()
      }

      if (ALLOWED_CONTROL_KEYS.has(event.key)) {
        onKeyDown?.(event)
        return
      }

      onKeyDown?.(event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)

      if (isComposingRef.current) {
        return
      }

      const rawValue = event.target.value
      const nextDigits = rawValue.replace(NON_DIGIT_REGEX, '')
      const caretPosition = event.target.selectionStart ?? rawValue.length
      const digitCountBeforeCaret = rawValue.slice(0, caretPosition).replace(NON_DIGIT_REGEX, '').length

      pendingCaretDigitCountRef.current = digitCountBeforeCaret
      onValueChange(nextDigits)
    }

    const handleCompositionStart = (event: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = true
      onCompositionStart?.(event)
    }

    const handleCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false
      onCompositionEnd?.(event)

      const rawValue = event.currentTarget.value
      const nextDigits = rawValue.replace(NON_DIGIT_REGEX, '')
      const digitCountBeforeCaret = rawValue.slice(0, event.currentTarget.selectionStart ?? rawValue.length).replace(NON_DIGIT_REGEX, '').length

      pendingCaretDigitCountRef.current = digitCountBeforeCaret
      onValueChange(nextDigits)
    }

    return (
      <>
        <span
          ref={sizerRef}
          aria-hidden="true"
          className="absolute -left-[9999px] top-0 whitespace-pre px-3 text-lg tracking-tight"
        >
          {formattedValue || placeholder}
        </span>

        <input
          {...inputProps}
          ref={(element) => {
            internalInputRef.current = element

            if (!ref) {
              return
            }

            if (typeof ref === 'function') {
              ref(element)
              return
            }

            ref.current = element
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={formattedValue}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          aria-invalid={validationError ? 'true' : undefined}
          aria-describedby={validationError ? errorId : inputProps['aria-describedby']}
          style={{ width: `${inputWidth}px`, ...(inputProps.style ?? {}) }}
          className={[
            'h-[44px] rounded-[6px] border-[1.5px] px-2 text-lg leading-none tracking-tight text-dark outline-none transition-all focus:border-primary-light focus:opacity-100 opacity-30',
            validationError ? 'border-red-500' : 'border-dark',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {validationError ? (
          <p id={errorId} className="mt-1 text-xs text-red-600">
            {validationError}
          </p>
        ) : null}
      </>
    )
  },
)

NumericGroupedInput.displayName = 'NumericGroupedInput'
