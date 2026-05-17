import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'

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

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'>

export interface NumericGroupedInputProps extends InputProps {
  value: string | number
  onValueChange: (digits: string) => void
  minWidth?: number
}

export const NumericGroupedInput = forwardRef<HTMLInputElement, NumericGroupedInputProps>(
  ({ value, onValueChange, minWidth = 72, className, onKeyDown, placeholder = '0', ...inputProps }, ref) => {
    const sizerRef = useRef<HTMLSpanElement>(null)
    const [inputWidth, setInputWidth] = useState(minWidth)

    const digitsValue = useMemo(() => toDigits(value), [value])
    const formattedValue = useMemo(() => formatDigitsByThousands(digitsValue), [digitsValue])

    useLayoutEffect(() => {
      if (!sizerRef.current) {
        return
      }

      const textWidth = Math.ceil(sizerRef.current.getBoundingClientRect().width)
      const horizontalChrome = 22

      setInputWidth(Math.max(minWidth, textWidth + horizontalChrome))
    }, [formattedValue, minWidth, placeholder])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!event.ctrlKey && !event.metaKey && event.key.length === 1 && !/\d/.test(event.key)) {
        event.preventDefault()
      }

      if (ALLOWED_CONTROL_KEYS.has(event.key)) {
        onKeyDown?.(event)
        return
      }

      onKeyDown?.(event)
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
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={formattedValue}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={(event) => onValueChange(event.target.value.replace(NON_DIGIT_REGEX, ''))}
          style={{ width: `${inputWidth}px`, ...(inputProps.style ?? {}) }}
          className={[
            'h-[44px] rounded-[6px] border-[1.5px] border-dark px-2 text-lg leading-none tracking-tight text-dark outline-none transition-all focus:border-primary-light focus:opacity-100 opacity-30',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </>
    )
  },
)

NumericGroupedInput.displayName = 'NumericGroupedInput'
