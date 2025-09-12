'use client'

import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addPoem, updatePoem, type Poem } from '@/lib/store/gameSlice'
import ImageDropzone from './ImageDropzone'
import VerseEditor from './VerseEditor'
import { Save, Play, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface GameCreatorProps {
  editingPoem?: Poem | null
  onCancel: () => void
  onTestGame: (poem: Poem) => void
}

export default function GameCreator({ editingPoem, onCancel, onTestGame }: GameCreatorProps) {
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    image: editingPoem?.image || null,
    verse: editingPoem?.verse || '',
    words: editingPoem?.words || [],
    wordGroups: editingPoem?.wordGroups || [],
    targetWord: editingPoem?.targetWord || '',
    targetWordGender: editingPoem?.targetWordGender || 'masculin' as 'masculin' | 'féminin',
    gameParticipatingWords: editingPoem?.gameParticipatingWords || [],
    wordColors: editingPoem?.wordColors || {}
  })

  const handleSave = () => {
    // Validation
    if (!formData.verse.trim()) {
      toast.error('Veuillez saisir un vers')
      return
    }
    
    if (formData.words.length === 0) {
      toast.error('Veuillez analyser le vers pour extraire les mots')
      return
    }
    
    if (formData.words.some(word => !word.class)) {
      toast.error('Veuillez attribuer une classe grammaticale à tous les mots')
      return
    }
    
    if (!formData.targetWord.trim()) {
      toast.error('Veuillez saisir le mot mystère pour l\'étape 3')
      return
    }

    // Mystery word specific validations
    const mysteryWordValidation = validateMysteryWord()
    if (!mysteryWordValidation.isValid) {
      toast.error(mysteryWordValidation.error)
      return
    }

    const poem: Poem = {
      id: editingPoem?.id || `poem-${Date.now()}`,
      image: formData.image,
      verse: formData.verse,
      words: formData.words,
      wordGroups: formData.wordGroups,
      targetWord: formData.targetWord.toUpperCase(),
      targetWordGender: formData.targetWordGender,
      createdAt: editingPoem?.createdAt || new Date().toISOString(),
      gameParticipatingWords: formData.gameParticipatingWords,
      wordColors: formData.wordColors
    }

    if (editingPoem) {
      dispatch(updatePoem(poem))
      toast.success('Jeu mis à jour avec succès!')
    } else {
      dispatch(addPoem(poem))
      toast.success('Nouveau jeu créé avec succès!')
    }

    // Optionally close the form
    onCancel()
  }

  const handleTest = () => {
    const poem: Poem = {
      id: editingPoem?.id || `poem-${Date.now()}`,
      image: formData.image,
      verse: formData.verse,
      words: formData.words,
      wordGroups: formData.wordGroups,
      targetWord: formData.targetWord.toUpperCase(),
      targetWordGender: formData.targetWordGender,
      createdAt: editingPoem?.createdAt || new Date().toISOString(),
      gameParticipatingWords: formData.gameParticipatingWords,
      wordColors: formData.wordColors
    }
    onTestGame(poem)
  }

  // Get participating words with their colors for mystery word preview
  const getParticipatingWordsWithColors = () => {
    return formData.gameParticipatingWords.map(wordIndex => {
      const word = formData.words[wordIndex]
      const color = formData.wordColors[wordIndex]
      return {
        word: word?.word || '',
        color: color || '#D1D5DB',
        index: wordIndex
      }
    })
  }

  // Validate mystery word against participating words
  const validateMysteryWord = () => {
    const participatingWords = getParticipatingWordsWithColors()
    const mysteryLetters = formData.targetWord.toUpperCase().split('')
    
    // Validation 1: Number of letters should match number of selected words
    if (mysteryLetters.length !== participatingWords.length) {
      return {
        isValid: false,
        error: `Le mot mystère doit avoir ${participatingWords.length} lettre${participatingWords.length > 1 ? 's' : ''} pour correspondre aux ${participatingWords.length} mot${participatingWords.length > 1 ? 's' : ''} sélectionné${participatingWords.length > 1 ? 's' : ''}`
      }
    }

    // Validation 2: Same letters should have same colors
    const letterColorMap = new Map<string, string>()
    for (let i = 0; i < mysteryLetters.length; i++) {
      const letter = mysteryLetters[i]
      const color = participatingWords[i].color
      
      if (letterColorMap.has(letter)) {
        if (letterColorMap.get(letter) !== color) {
          return {
            isValid: false,
            error: `La lettre "${letter}" apparaît plusieurs fois mais avec des couleurs différentes. Assurez-vous que tous les mots correspondant à la même lettre aient la même couleur.`
          }
        }
      } else {
        letterColorMap.set(letter, color)
      }
    }

    return { isValid: true, error: '' }
  }

  // Get mystery word preview with colors
  const getMysteryWordPreview = () => {
    const participatingWords = getParticipatingWordsWithColors()
    const mysteryLetters = formData.targetWord.toUpperCase().split('')
    
    return mysteryLetters.map((letter, index) => ({
      letter,
      color: participatingWords[index]?.color || '#D1D5DB',
      word: participatingWords[index]?.word || '',
      isValid: index < participatingWords.length
    }))
  }

  const canTest = formData.verse.trim() && 
    formData.words.length > 0 && 
    formData.words.every(word => word.class) && 
    formData.targetWord.trim()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {editingPoem ? 'Modifier le jeu' : 'Créer un nouveau jeu'}
          </h2>
        </div>
        <div className="flex space-x-3">
          {canTest && (
            <button
              onClick={handleTest}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Tester</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Image Dropzone */}
        <ImageDropzone
          currentImage={formData.image}
          onImageSelect={(imageUrl) => setFormData(prev => ({ ...prev, image: imageUrl }))}
        />

        {/* 2. Verse Editor */}
        <VerseEditor
          verse={formData.verse}
          words={formData.words}
          wordGroups={formData.wordGroups}
          gameParticipatingWords={formData.gameParticipatingWords}
          wordColors={formData.wordColors}
          onVerseChange={(verse) => setFormData(prev => ({ ...prev, verse }))}
          onWordsChange={(words) => setFormData(prev => ({ ...prev, words }))}
          onWordGroupsChange={(wordGroups) => setFormData(prev => ({ ...prev, wordGroups }))}
          onGameParticipatingWordsChange={(gameParticipatingWords) => setFormData(prev => ({ ...prev, gameParticipatingWords }))}
          onWordColorsChange={(wordColors) => setFormData(prev => ({ ...prev, wordColors }))}
        />

        {/* 3. Target Word Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot mystère pour l'étape 3
          </label>
          <input
            type="text"
            value={formData.targetWord}
            onChange={(e) => setFormData(prev => ({ ...prev, targetWord: e.target.value }))}
            placeholder="Ex: HORAIRE"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 uppercase"
          />
          <p className="text-sm text-gray-500 mt-1">
            Ce mot sera formé en glissant-déposant les lettres colorées
          </p>

          {/* Mystery Word Preview */}
          {formData.targetWord.trim() && formData.gameParticipatingWords.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu du mot mystère :</h4>
              
              {/* Letter preview */}
              <div className="flex flex-wrap gap-2 mb-3">
                {getMysteryWordPreview().map((letterInfo, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2"
                      style={{ 
                        backgroundColor: letterInfo.isValid ? letterInfo.color : '#E5E7EB',
                        borderColor: letterInfo.isValid ? letterInfo.color : '#D1D5DB'
                      }}
                    >
                      {letterInfo.letter}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 max-w-12 truncate" title={letterInfo.word}>
                      {letterInfo.isValid ? letterInfo.word : '?'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation status */}
              {(() => {
                const validation = validateMysteryWord()
                return (
                  <div className={`text-sm p-2 rounded ${validation.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {validation.isValid ? (
                      <span className="flex items-center">
                        ✅ Configuration valide
                      </span>
                    ) : (
                      <span className="flex items-center">
                        ❌ {validation.error}
                      </span>
                    )}
                  </div>
                )
              })()}

              {/* Word mapping display */}
              {formData.targetWord.trim() && formData.gameParticipatingWords.length > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Correspondance :</p>
                  <div className="space-y-1">
                    {getMysteryWordPreview().map((letterInfo, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span 
                          className="inline-block w-6 h-6 rounded text-white text-center text-xs font-bold flex items-center justify-center"
                          style={{ backgroundColor: letterInfo.color }}
                        >
                          {letterInfo.letter}
                        </span>
                        <span>→</span>
                        <span>{letterInfo.isValid ? letterInfo.word : 'Mot manquant'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Genre du mot mystère
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="masculin"
                checked={formData.targetWordGender === 'masculin'}
                onChange={(e) => setFormData(prev => ({ ...prev, targetWordGender: e.target.value as 'masculin' | 'féminin' }))}
                className="mr-2 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-blue-700 font-medium">🔵 Masculin (Un {formData.targetWord.toLowerCase()})</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="féminin"
                checked={formData.targetWordGender === 'féminin'}
                onChange={(e) => setFormData(prev => ({ ...prev, targetWordGender: e.target.value as 'masculin' | 'féminin' }))}
                className="mr-2 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-pink-700 font-medium">🔴 Féminin (Une {formData.targetWord.toLowerCase()})</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}