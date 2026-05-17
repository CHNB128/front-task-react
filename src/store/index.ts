import { create } from 'zustand'

export interface Person {
  id: number
  name: string
  ageInHours: number
  photoUrl: string
}

interface AppState {
  people: Person[]
  minimumAgeInMonths: number
  updatePersonAge: (id: number, ageInHours: number) => void
  setMinimumAgeInMonths: (months: number) => void
}

export const useStore = create<AppState>((set) => ({
  people: [
    {
      id: 1,
      name: 'Alice',
      ageInHours: 262800,
      photoUrl: '/users/alice.jpg',
    },
    {
      id: 2,
      name: 'Bob',
      ageInHours: 350400,
      photoUrl: '/users/bob.jpg',
    },
    {
      id: 3,
      name: 'Charlie',
      ageInHours: 219000,
      photoUrl: '/users/charlie.jpg',
    },
  ],
  minimumAgeInMonths: 0,
  updatePersonAge: (id, ageInHours) =>
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, ageInHours } : p)),
    })),
  setMinimumAgeInMonths: (months) => set({ minimumAgeInMonths: months }),
}))
