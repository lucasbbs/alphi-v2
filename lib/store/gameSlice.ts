import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface GameWord {
  word: string
  class: string
  isSelected: boolean
}

export interface Poem {
  id: string
  image: string | null
  verse: string
  words: GameWord[]
  targetWord: string
  targetWordGender: 'masculin' | 'féminin'
  createdAt: string
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
        { word: 'viendra', class: 'verbe', isSelected: false },
        { word: 'sa', class: 'déterminant possessif', isSelected: false },
        { word: 'froide', class: 'adjectif', isSelected: false },
        { word: 'sur', class: 'préposition', isSelected: false },
        { word: 'rêves', class: 'nom commun', isSelected: false }
      ],
      targetWord: 'HORAIRE',
      targetWordGender: 'masculin',
      createdAt: new Date().toISOString()
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