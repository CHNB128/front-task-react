import { Link } from 'react-router-dom'
import { UserAvatar } from '@/components/UserAvatar'
import { useStore } from '@/store'

export default function PeopleList() {
  const people = useStore((state) => state.people)

  const peopleWithYears = people.map((person) => ({
    ...person,
    ageInYears: Math.floor(person.ageInHours / 8760),
  }))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="ui-title">People</h1>

      <div className="flex flex-col gap-3">
        {peopleWithYears.map((person) => (
          <Link
            key={person.id}
            to={`/person/${person.id}`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 no-underline hover:border-primary hover:no-underline"
          >
            <UserAvatar name={person.name} src={person.photoUrl} size="sm" />
            <div>
              <div className="font-bold text-dark font-koulen">{person.name}</div>
              <div className="text-gray-600">{person.ageInYears} years old</div>
            </div>
          </Link>
        ))}
      </div>

      <Link to="/settings" className="ui-link">
        Settings
      </Link>
    </div>
  )
}
