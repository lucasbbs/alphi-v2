'use client'

import React, { useState, useEffect } from 'react'
import { GameWord } from '@/lib/store/gameSlice'

const wordClasses = [
  { name: 'adverbe', color: 'bg-orange-400' },
  { name: 'déterminant défini', color: 'bg-pink-400' },
  { name: 'verbe', color: 'bg-green-400' },
  { name: 'déterminant possessif', color: 'bg-yellow-400' },
  { name: 'adjectif', color: 'bg-red-400' },
  { name: 'préposition', color: 'bg-green-400' },
  { name: 'nom commun', color: 'bg-blue-400' },
  { name: 'pronom', color: 'bg-purple-400' },
  { name: 'conjonction', color: 'bg-indigo-400' },
  { name: 'interjection', color: 'bg-cyan-400' }
]

interface VerseEditorProps {
  verse: string
  words: GameWord[]
  onVerseChange: (verse: string) => void
  onWordsChange: (words: GameWord[]) => void
}

export default function VerseEditor({ verse, words, onVerseChange, onWordsChange }: VerseEditorProps) {
  const [parsedWords, setParsedWords] = useState<GameWord[]>([])

  // Fonction d'attribution automatique des classes grammaticales
  const autoClassifyWord = (word: string): string => {
    const cleanWord = word.toLowerCase().replace(/['']/g, '\'')
    
    // Déterminants définis
    if (['le', 'la', 'les', 'l\'', 'du', 'des', 'au', 'aux'].includes(cleanWord)) {
      return 'déterminant défini'
    }
    
    // Déterminants possessifs
    if (['mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs'].includes(cleanWord)) {
      return 'déterminant possessif'
    }
    
    // Prépositions communes
    if (['à', 'de', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'entre', 'vers', 'chez', 'depuis', 'pendant', 'après', 'avant'].includes(cleanWord)) {
      return 'préposition'
    }
    
    // Pronoms
    if (['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'lui', 'leur', 'y', 'en', 'qui', 'que', 'dont', 'où'].includes(cleanWord)) {
      return 'pronom'
    }
    
    // Conjonctions
    if (['et', 'ou', 'mais', 'car', 'donc', 'or', 'ni', 'que', 'si', 'comme', 'quand', 'lorsque', 'puisque'].includes(cleanWord)) {
      return 'conjonction'
    }
    
    // Adverbes fréquents
    if (['très', 'bien', 'mal', 'plus', 'moins', 'beaucoup', 'peu', 'trop', 'assez', 'encore', 'déjà', 'jamais', 'toujours', 'souvent', 'parfois', 'hier', 'aujourd\'hui', 'demain', 'maintenant', 'bientôt', 'tard', 'tôt'].includes(cleanWord)) {
      return 'adverbe'
    }
    
    // Verbes courants (infinitif et conjugaisons fréquentes)
    if (cleanWord.match(/(er|ir|re|oir)$/) || 
        ['est', 'était', 'sera', 'avoir', 'être', 'faire', 'aller', 'venir', 'voir', 'savoir', 'pouvoir', 'vouloir', 'dire', 'prendre', 'donner', 'mettre', 'porter', 'laisser', 'rester', 'devenir', 'tenir', 'arriver', 'passer', 'partir', 'sortir', 'entrer', 'monter', 'descendre', 'tomber', 'viendra', 'viendrait'].includes(cleanWord)) {
      return 'verbe'
    }
    
    // Adjectifs courants (patterns simples)
    if (cleanWord.match(/(able|ible|eux|euse|ique|al|elle|if|ive|ant|ent)$/)) {
      return 'adjectif'
    }
    
    // Noms (par défaut pour les mots non classés)
    return 'nom commun'
  }

  // Analyser le vers en mots quand il change
  useEffect(() => {
    if (verse.trim()) {
      const wordTokens = verse
        .split(/(\s+|[.,;:!?()\"'])/)
        .filter(token => token.trim() && !/^\s+$/.test(token) && !/^[.,;:!?()\"']+$/.test(token))
        
      const newWords: GameWord[] = wordTokens.map((word, index) => {
        const existingWord = words.find(w => w.word === word)
        return existingWord || { 
          word, 
          class: autoClassifyWord(word), // Attribution automatique
          isSelected: false 
        }
      })
      
      setParsedWords(newWords)
      onWordsChange(newWords)
    } else {
      setParsedWords([])
      onWordsChange([])
    }
  }, [verse])

  const handleClassChange = (wordIndex: number, className: string) => {
    const updatedWords = [...parsedWords]
    updatedWords[wordIndex] = { ...updatedWords[wordIndex], class: className }
    setParsedWords(updatedWords)
    onWordsChange(updatedWords)
  }

  const getWordColor = (className: string) => {
    const wordClass = wordClasses.find(wc => wc.name === className)
    return wordClass ? wordClass.color : 'bg-gray-200'
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vers du poème
        </label>
        <textarea
          value={verse}
          onChange={(e) => onVerseChange(e.target.value)}
          placeholder="Saisissez le vers du poème ici..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-1">
          Le vers sera automatiquement analysé et les classes grammaticales attribuées. Vous pouvez les modifier si nécessaire.
        </p>
      </div>

      {parsedWords.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Classification grammaticale des mots
          </label>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prévisualisation :</h4>
            <div className="flex flex-wrap gap-2">
              {parsedWords.map((word, index) => (
                <span 
                  key={index}
                  className={`px-2 py-1 rounded text-white text-sm font-medium ${getWordColor(word.class)}`}
                >
                  {word.word}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {parsedWords.map((word, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-right">
                  <span className="text-sm font-medium text-gray-700">
                    "{word.word}"
                  </span>
                </div>
                <select
                  value={word.class}
                  onChange={(e) => handleClassChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Choisir une classe...</option>
                  {wordClasses.map((wc) => (
                    <option key={wc.name} value={wc.name}>
                      {wc.name}
                    </option>
                  ))}
                </select>
                {word.class && (
                  <div className={`w-6 h-6 rounded ${getWordColor(word.class)}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}