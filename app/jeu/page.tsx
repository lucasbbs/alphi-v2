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

interface DroppedLetter {
  letter: string
  color: string
  id: string
}

// Classes de mots avec leurs couleurs et lettres selon le tableau fourni
const wordClasses: WordClass[] = [
  { name: 'adverbe', color: 'bg-orange-400', letter: 'H' },        // Demain → Orange → H
  { name: 'déterminant défini', color: 'bg-pink-400', letter: 'O' }, // L' → Pink → O
  { name: 'verbe', color: 'bg-green-400', letter: 'R' },           // Viendra → Green → R
  { name: 'déterminant possessif', color: 'bg-yellow-400', letter: 'A' }, // Sa → Yellow → A
  { name: 'adjectif', color: 'bg-red-400', letter: 'I' },          // Froide → Red → I
  { name: 'préposition', color: 'bg-green-400', letter: 'R' },     // Sur → Green → R
  { name: 'nom commun', color: 'bg-blue-400', letter: 'E' }        // Rêves → Blue → E
]

// Données d'exemple
const samplePoems: Poem[] = [
  {
    id: 1,
    image: '/logo.png',
    verse: 'Demain, l\'hiver viendra poser sa main froide sur nos rêves.',
    words: [
      { word: 'Demain', class: 'adverbe', isSelected: false },        // H
      { word: 'l\'', class: 'déterminant défini', isSelected: false }, // O
      { word: 'viendra', class: 'verbe', isSelected: false },         // R
      { word: 'sa', class: 'déterminant possessif', isSelected: false }, // A
      { word: 'froide', class: 'adjectif', isSelected: false },       // I
      { word: 'sur', class: 'préposition', isSelected: false },       // R
      { word: 'rêves', class: 'nom commun', isSelected: false }        // E
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
  const [lives, setLives] = useState(3)
  const [droppedLetters, setDroppedLetters] = useState<DroppedLetter[]>([])
  const [availableLetters, setAvailableLetters] = useState<DroppedLetter[]>([])
  const [gameOver, setGameOver] = useState(false)

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
    // Générer l'alphabet avec les couleurs correspondantes
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const coloredAlphabet: DroppedLetter[] = alphabet.map(letter => {
      const wordClass = wordClasses.find(wc => wc.letter === letter)
      return {
        letter,
        color: wordClass ? wordClass.color : 'bg-gray-300',
        id: `letter-${letter}-${Math.random()}`
      }
    })
    setAvailableLetters(coloredAlphabet)
    setDroppedLetters([])
    setCurrentStep(3)
  }

  const loseLife = () => {
    if (gameOver) return // Ne pas perdre de vie si le jeu est déjà terminé
    const newLives = Math.max(0, lives - 1) // Empêcher les vies négatives
    setLives(newLives)
    if (newLives <= 0) {
      setGameOver(true)
    }
  }

  const handleWordClassAssignmentWithLives = (wordIndex: number, className: string) => {
    const updatedWords = [...gameWords]
    const previousClass = updatedWords[wordIndex].class
    updatedWords[wordIndex].class = className
    setGameWords(updatedWords)
    
    // Vérifier si c'est la bonne réponse (optionnel, pour feedback immédiat)
    const correctWord = samplePoems[0].words[wordIndex]
    if (className !== '' && className !== correctWord.class && previousClass === '') {
      loseLife()
    }
  }

  const handleLetterDrop = (letter: DroppedLetter) => {
    if (droppedLetters.length < 7) {
      // Créer une nouvelle instance de la lettre pour permettre la réutilisation
      const newLetter: DroppedLetter = {
        ...letter,
        id: `dropped-${letter.letter}-${Date.now()}-${Math.random()}`
      }
      setDroppedLetters([...droppedLetters, newLetter])
      // Ne pas retirer la lettre de availableLetters pour permettre la réutilisation
    }
  }

  const handleLetterRemove = (letterId: string) => {
    // Simplement retirer la lettre des lettres déposées
    // Les lettres restent disponibles dans l'alphabet
    setDroppedLetters(droppedLetters.filter(l => l.id !== letterId))
  }

  const checkWordInStep3 = () => {
    const formedWord = droppedLetters.map(l => l.letter).join('')
    if (formedWord === 'HORAIRE') {
      setFoundWord(formedWord)
      setCurrentStep(4)
    } else {
      // Perdre une vie seulement quand l'utilisateur clique sur "Vérifier le mot !"
      loseLife()
      // Réinitialiser seulement les lettres déposées
      setDroppedLetters([])
    }
  }

  const handleGenderSelection = (gender: string) => {
    if (gameOver || selectedGender) return // Empêcher multiples sélections
    setSelectedGender(gender)
    if (gender === 'féminin') {
      loseLife()
    }
  }

  const resetGame = () => {
    setCurrentStep(1)
    setSelectedPoem(null)
    setGameWords([])
    setFoundWord('')
    setSelectedGender('')
    setLives(3)
    setDroppedLetters([])
    setAvailableLetters([])
    setGameOver(false)
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
            <div className="text-right flex flex-col items-end">
              <div className="text-lg font-semibold text-orange-500 mb-2">Étape {currentStep}/4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
              {/* Affichage des vies */}
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-600 mr-2">Vies:</span>
                {[...Array(3)].map((_, index) => (
                  <span key={index} className={`text-xl ${index < lives ? 'text-red-500' : 'text-gray-300'}`}>
                    ❤️
                  </span>
                ))}
              </div>
              {gameOver && (
                <div className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  Jeu Terminé!
                </div>
              )}
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
                        onChange={(e) => handleWordClassAssignmentWithLives(index, e.target.value)}
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
                disabled={gameWords.some(gw => !gw.class) || gameOver}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Étape Suivante 🚀
              </button>
              {gameOver && (
                <div className="mt-4">
                  <button 
                    onClick={resetGame}
                    className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
                  >
                    Recommencer le Jeu 🔄
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Étape 3: Glisser-Déposer l'Alphabet */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🔤 Étape 3: Formez le mot mystère !
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Glissez et déposez les lettres colorées dans le bon ordre pour former le mot mystère. 
              L'ordre suit celui des mots dans la phrase !
            </p>

            {/* Zone de dépôt pour le mot */}
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Mot mystère :</h3>
              <div className="flex justify-center items-center space-x-2 mb-4 min-h-[80px]">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div 
                    key={index}
                    className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white"
                    onDrop={(e) => {
                      e.preventDefault()
                      const letterId = e.dataTransfer.getData('letterId')
                      const letter = availableLetters.find(l => l.id === letterId)
                      if (letter && droppedLetters.length === index) {
                        handleLetterDrop(letter)
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {droppedLetters[index] ? (
                      <div 
                        className={`w-12 h-12 ${droppedLetters[index].color} rounded-lg flex items-center justify-center cursor-pointer text-white font-bold text-xl`}
                        onClick={() => handleLetterRemove(droppedLetters[index].id)}
                      >
                        {droppedLetters[index].letter}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-2xl">{index + 1}</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600">
                Mot actuel: <span className="font-bold">{droppedLetters.map(l => l.letter).join('')}</span>
              </p>
            </div>

            {/* Alphabet disponible */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Alphabet :</h3>
              <div className="flex flex-wrap justify-center gap-2 max-w-6xl mx-auto">
                {availableLetters.map((letter) => (
                  <div
                    key={letter.id}
                    draggable={!gameOver}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('letterId', letter.id)
                    }}
                    className={`w-10 h-10 ${letter.color} rounded-lg flex items-center justify-center cursor-pointer text-white font-bold text-base hover:scale-110 transition-transform ${gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {letter.letter}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Les lettres colorées correspondent aux classes de mots. Glissez-les dans l'ordre des mots de la phrase !
              </p>
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              <button 
                onClick={checkWordInStep3}
                disabled={droppedLetters.length !== 7 || gameOver}
                className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Vérifier le Mot ! ✨
              </button>
              
              {droppedLetters.length > 0 && !gameOver && (
                <button 
                  onClick={() => {
                    setDroppedLetters([])
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-600 transition-colors ml-4"
                >
                  Effacer 🗑️
                </button>
              )}

              {gameOver && (
                <div className="mt-4">
                  <button 
                    onClick={resetGame}
                    className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
                  >
                    Recommencer le Jeu 🎮
                  </button>
                </div>
              )}
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
                disabled={gameOver || selectedGender !== ''}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedGender === 'masculin' 
                    ? 'bg-blue-500 text-white shadow-lg scale-105' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                🔵 Un {foundWord.toLowerCase()}
              </button>
              <button 
                onClick={() => handleGenderSelection('féminin')}
                disabled={gameOver || selectedGender !== ''}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    onClick={resetGame}
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