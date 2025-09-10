'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

// Types pour le jeu
interface WordClass {
  name: string
  color: string
  letter: string
}

interface GameWord {
  word: string
  class: string
  isSelected: boolean
}

interface Poem {
  id: number
  image: string
  verse: string
  words: GameWord[]
}

// Classes de mots avec leurs couleurs et lettres
const wordClasses: WordClass[] = [
  { name: 'nom commun', color: 'bg-red-400', letter: 'H' },
  { name: 'adverbe', color: 'bg-blue-400', letter: 'O' },
  { name: 'déterminant défini', color: 'bg-green-400', letter: 'R' },
  { name: 'verbe', color: 'bg-yellow-400', letter: 'A' },
  { name: 'déterminant possessif', color: 'bg-purple-400', letter: 'I' },
  { name: 'adjectif', color: 'bg-pink-400', letter: 'R' },
  { name: 'préposition', color: 'bg-orange-400', letter: 'E' }
]

// Données d'exemple
const samplePoems: Poem[] = [
  {
    id: 1,
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
    ]
  }
]

export default function JeuPage() {
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)
  const [gameWords, setGameWords] = useState<GameWord[]>([])
  const [foundWord, setFoundWord] = useState('')
  const [selectedGender, setSelectedGender] = useState('')

  const handlePoemSelection = (poem: Poem) => {
    setSelectedPoem(poem)
    setGameWords([...poem.words])
    setCurrentStep(2)
  }

  const handleWordClassAssignment = (wordIndex: number, className: string) => {
    const updatedWords = [...gameWords]
    updatedWords[wordIndex].class = className
    setGameWords(updatedWords)
  }

  const proceedToStep3 = () => {
    // Calculer le mot formé par les lettres
    let letters = ''
    gameWords.forEach(gameWord => {
      const wordClass = wordClasses.find(wc => wc.name === gameWord.class)
      if (wordClass) {
        letters += wordClass.letter
      }
    })
    setFoundWord(letters)
    setCurrentStep(3)
  }

  const handleGenderSelection = (gender: string) => {
    setSelectedGender(gender)
    // Pas besoin de changer d'étape ici, on reste à l'étape 4 pour afficher le feedback
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Connectez-vous pour jouer !</h1>
          <p className="text-gray-600">Vous devez être connecté pour accéder au jeu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-br from-orange-100 via-pink-50 to-teal-100 p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* En-tête du jeu */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🎯 Alphi - Jeu de Grammaire</h1>
              <p className="text-gray-600">Bonjour {user.firstName} ! Prêt(e) à jouer ?</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-500">Étape {currentStep}/4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection d'image */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              📸 Étape 1: Choisissez une image
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Chaque image représente un vers d'un poème. Sélectionnez celle qui vous plaît !
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {samplePoems.map((poem) => (
                <div 
                  key={poem.id}
                  className="bg-gradient-to-br from-orange-200 to-pink-200 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200 border-4 border-transparent hover:border-orange-400"
                  onClick={() => handlePoemSelection(poem)}
                >
                  <div className="aspect-video bg-orange-300 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-6xl">🌅</span>
                  </div>
                  <p className="text-gray-700 font-medium text-center">{poem.verse}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2: Attribution des classes de mots */}
        {currentStep === 2 && selectedPoem && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🏷️ Étape 2: Attribuez les classes de mots
            </h2>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Vers sélectionné :</h3>
              <p className="text-lg text-gray-700">
                {selectedPoem.verse.split(' ').map((word, index) => {
                  const gameWord = gameWords.find(gw => gw.word === word.replace(/[.,!?]/g, ''))
                  return gameWord ? (
                    <span key={index} className="font-bold text-orange-600 mx-1">
                      {word}
                    </span>
                  ) : (
                    <span key={index} className="mx-1">{word}</span>
                  )
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Mots à classer :</h4>
                <div className="space-y-3">
                  {gameWords.map((gameWord, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-800">{gameWord.word}</div>
                      <select 
                        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                        value={gameWord.class}
                        onChange={(e) => handleWordClassAssignment(index, e.target.value)}
                      >
                        <option value="">Choisir une classe...</option>
                        {wordClasses.map((wc) => (
                          <option key={wc.name} value={wc.name}>{wc.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Classes de mots :</h4>
                <div className="space-y-2">
                  {wordClasses.map((wc) => (
                    <div key={wc.name} className="flex items-center">
                      <div className={`w-4 h-4 rounded ${wc.color} mr-3`}></div>
                      <span className="text-gray-700">{wc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={proceedToStep3}
                disabled={gameWords.some(gw => !gw.class)}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Étape Suivante 🚀
              </button>
            </div>
          </div>
        )}

        {/* Étape 3: Découverte du mot */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🔤 Étape 3: Découvrez le mot mystère !
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Chaque couleur représente une lettre. Voici le mot que vous avez formé :
            </p>
            
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-8 mb-8">
              <div className="flex justify-center items-center space-x-4 mb-6">
                {foundWord.split('').map((letter, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                    <span className="text-3xl font-bold text-gray-800">{letter}</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Le mot est : <span className="text-orange-600">{foundWord}</span></h3>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setCurrentStep(4)}
                className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors"
              >
                Dernière Étape ! 🎯
              </button>
            </div>
          </div>
        )}

        {/* Étape 4: Genre du mot */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              ⚡ Étape 4: Quel est le genre du mot ?
            </h2>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">{foundWord}</h3>
              <p className="text-gray-600">Ce mot est-il masculin ou féminin ?</p>
            </div>

            <div className="flex justify-center space-x-6 mb-8">
              <button 
                onClick={() => handleGenderSelection('masculin')}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                  selectedGender === 'masculin' 
                    ? 'bg-blue-500 text-white shadow-lg scale-105' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                🔵 Un {foundWord.toLowerCase()}
              </button>
              <button 
                onClick={() => handleGenderSelection('féminin')}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                  selectedGender === 'féminin' 
                    ? 'bg-pink-500 text-white shadow-lg scale-105' 
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                🔴 Une {foundWord.toLowerCase()}
              </button>
            </div>

            {selectedGender && (
              <div className={`rounded-2xl p-6 text-center ${
                selectedGender === 'masculin' 
                  ? 'bg-gradient-to-r from-green-100 to-teal-100' 
                  : 'bg-gradient-to-r from-red-100 to-pink-100'
              }`}>
                <div className="text-4xl mb-4">
                  {selectedGender === 'masculin' ? '🎉' : '❌'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedGender === 'masculin' ? 'Bravo !' : 'Pas tout à fait...'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedGender === 'masculin' 
                    ? `Excellent ! Le mot "horaire" est effectivement masculin. On dit "un horaire".`
                    : `Le mot "horaire" est masculin, pas féminin. On dit "un horaire", pas "une horaire". Par exemple : "Mon horaire de travail commence à 9h."`
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => {
                      setCurrentStep(1)
                      setSelectedPoem(null)
                      setFoundWord('')
                      setSelectedGender('')
                    }}
                    className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                  >
                    Rejouer 🔄
                  </button>
                  {selectedGender === 'féminin' && (
                    <button 
                      onClick={() => setSelectedGender('')}
                      className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Réessayer 🔁
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}