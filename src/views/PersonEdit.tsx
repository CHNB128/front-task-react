import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NumericGroupedInput } from '@/components/NumericGroupedInput'
import { UserAvatar } from '@/components/UserAvatar'
import { useStore } from '@/store'

export default function PersonEdit() {
  const { id } = useParams<{ id: string }>()
  const person = useStore((state) => state.people.find((p) => p.id === Number(id)))
  const updatePersonAge = useStore((state) => state.updatePersonAge)
  const [isInputFocused, setIsInputFocused] = useState(false)

  if (!person) {
    return (
      <div>
        <p className="text-gray-600">Person not found</p>
        <Link to="/" className="ui-link">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/" className="ui-link">
        &larr; Back
      </Link>

      <div className="flex items-center gap-3">
        <UserAvatar
          name={person.name}
          src={person.photoUrl}
          size="md"
          isActive={isInputFocused}
          activeBorderClassName="border-primary"
          inactiveBorderClassName="border-white"
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="hours-input"
            className={['ui-label', isInputFocused ? 'text-primary' : 'text-dark'].join(' ')}
          >
            {person.name.toUpperCase()} IS
          </label>

          <div className="flex items-center gap-3">
            <NumericGroupedInput
              id="hours-input"
              value={person.ageInHours}
              onValueChange={(digits) => updatePersonAge(person.id, Number(digits || '0'))}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              aria-label="Age in hours"
            />
            <span className="leading-none tracking-tight text-gray-600">hours old</span>
          </div>
        </div>
      </div>
    </div>
  )
}
