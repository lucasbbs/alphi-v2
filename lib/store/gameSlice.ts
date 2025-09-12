import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface WordGroup {
  id: string
  name: string
  color: string
  wordIndices: number[]
}

export interface GameWord {
  word: string
  class: string
  isSelected: boolean
  groupId?: string
}

export interface Poem {
  id: string
  image: string | null
  verse: string
  words: GameWord[]
  wordGroups: WordGroup[]
  targetWord: string
  targetWordGender: 'masculin' | 'féminin'
  createdAt: string
  // Game configuration
  gameParticipatingWords?: number[] // Indices of words that participate in the game
  wordColors?: {[key: number]: string} // Custom colors for each word
}

interface GameState {
  poems: Poem[]
  currentEditingPoem: Poem | null
}

// Charger les poèmes depuis localStorage si disponibles
const loadPersistedPoems = (): Poem[] => {
  if (typeof window !== 'undefined') {
    try {
      const savedPoems = localStorage.getItem('alphi-admin-poems')
      if (savedPoems) {
        return JSON.parse(savedPoems)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des poèmes:', error)
    }
  }
  
  // Poèmes par défaut
  return [
    {
      id: 'default-1',
      image: '/logo.png',
      verse: 'Demain, l\'hiver viendra poser sa main froide sur nos rêves.',
      words: [
        { word: 'Demain', class: 'adverbe', isSelected: false },
        { word: 'l\'', class: 'déterminant défini', isSelected: false },
        { word: 'viendra', class: 'verbe', isSelected: false, groupId: 'verbe-groupe-1' },
        { word: 'poser', class: 'verbe', isSelected: false, groupId: 'verbe-groupe-1' },
        { word: 'sa', class: 'déterminant possessif', isSelected: false },
        { word: 'froide', class: 'adjectif', isSelected: false },
        { word: 'sur', class: 'préposition', isSelected: false },
        { word: 'rêves', class: 'nom commun', isSelected: false }
      ],
      wordGroups: [
        {
          id: 'verbe-groupe-1',
          name: 'Groupe verbal',
          color: '#10B981',
          wordIndices: [2, 3]
        }
      ],
      targetWord: 'HORAIRE',
      targetWordGender: 'masculin',
      createdAt: new Date().toISOString(),
      gameParticipatingWords: [0, 2, 3, 5], // Example: some words participating
      wordColors: { 0: "#EF4444", 2: "#10B981", 3: "#10B981", 5: "#F59E0B" } // Example colors
    }
  ]
}

const initialState: GameState = {
  poems: loadPersistedPoems(),
  currentEditingPoem: null
}

// Fonction pour sauvegarder dans localStorage
const saveToLocalStorage = (poems: Poem[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('alphi-admin-poems', JSON.stringify(poems))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des poèmes:', error)
    }
  }
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addPoem: (state, action: PayloadAction<Poem>) => {
      state.poems.push(action.payload)
      saveToLocalStorage(state.poems)
    },
    updatePoem: (state, action: PayloadAction<Poem>) => {
      const index = state.poems.findIndex(poem => poem.id === action.payload.id)
      if (index !== -1) {
        state.poems[index] = action.payload
      }
      saveToLocalStorage(state.poems)
    },
    deletePoem: (state, action: PayloadAction<string>) => {
      state.poems = state.poems.filter(poem => poem.id !== action.payload)
      saveToLocalStorage(state.poems)
    },
    setCurrentEditingPoem: (state, action: PayloadAction<Poem | null>) => {
      state.currentEditingPoem = action.payload
    },
    clearCurrentEditingPoem: (state) => {
      state.currentEditingPoem = null
    }
  }
})

export const { addPoem, updatePoem, deletePoem, setCurrentEditingPoem, clearCurrentEditingPoem } = gameSlice.actions
export default gameSlice.reducer