import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumericGroupedInput } from '@/components/NumericGroupedInput'
import { useStore } from '@/store'

export default function Settings() {
  const minimumAgeInMonths = useStore((state) => state.minimumAgeInMonths)
  const setMinimumAgeInMonths = useStore((state) => state.setMinimumAgeInMonths)
  const [isInputFocused, setIsInputFocused] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/">&larr; Back</Link>

      <h1>Settings</h1>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="min-age-input"
          className={isInputFocused ? 'text-primary' : 'text-dark'}
        >
          MINIMUM AGE
        </label>
        <div className="flex items-center gap-3">
          <NumericGroupedInput
            id="min-age-input"
            value={minimumAgeInMonths}
            onValueChange={(digits) => setMinimumAgeInMonths(Number(digits || '0'))}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            aria-label="Minimum age in months"
          />
          <span className="leading-none tracking-tight text-gray-600">months</span>
        </div>
      </div>
    </div>
  )
}
