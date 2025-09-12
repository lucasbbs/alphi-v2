'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import toast from 'react-hot-toast'
import { Clock } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

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
  groupId?: string
}

interface WordGroup {
  id: string
  name: string
  color: string
  wordIndices: number[]
}

interface Poem {
  id: string | number
  image: string | null
  verse: string
  words: GameWord[]
  wordGroups: WordGroup[]
  targetWord?: string
  targetWordGender?: 'masculin' | 'féminin'
  gameParticipatingWords?: number[]
  wordColors?: {[key: number]: string}
}

interface DroppedLetter {
  letter: string
  color: string
  id: string
  customStyle?: { backgroundColor: string }
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

// Données par défaut (maintenues pour compatibilité)
const defaultPoems: Poem[] = [
  {
    id: 'default-1',
    image: '/logo.png',
    verse: 'Demain, l\'hiver viendra poser sa main froide sur nos rêves.',
    words: [
      { word: 'Demain', class: 'adverbe', isSelected: false },        // H
      { word: 'l\'', class: 'déterminant défini', isSelected: false }, // O
      { word: 'viendra', class: 'verbe', isSelected: false, groupId: 'verbe-groupe-1' },         // R
      { word: 'poser', class: 'verbe', isSelected: false, groupId: 'verbe-groupe-1' },
      { word: 'sa', class: 'déterminant possessif', isSelected: false }, // A
      { word: 'froide', class: 'adjectif', isSelected: false },       // I
      { word: 'sur', class: 'préposition', isSelected: false },       // R
      { word: 'rêves', class: 'nom commun', isSelected: false }        // E
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
    targetWordGender: 'masculin'
  }
]

export default function JeuPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const poems = useSelector((state: RootState) => state.game.poems)
  
  // État du jeu
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)
  const [gameWords, setGameWords] = useState<GameWord[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<GameWord[]>([])
  const [foundWord, setFoundWord] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [lives, setLives] = useState(3)
  const [droppedLetters, setDroppedLetters] = useState<DroppedLetter[]>([])
  const [availableLetters, setAvailableLetters] = useState<DroppedLetter[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [sessionTime, setSessionTime] = useState<number>(0)
  const [gameScore, setGameScore] = useState<number>(0)
  const [availablePoems, setAvailablePoems] = useState<Poem[]>([])

  // Charger les poèmes disponibles depuis Redux ou paramètres de test
  useEffect(() => {
    const testParam = searchParams.get('test')
    if (testParam === 'true') {
      try {
        const testPoemData = localStorage.getItem('alphi-test-poem')
        if (testPoemData) {
          const testPoem = JSON.parse(testPoemData)
          setAvailablePoems([testPoem])
          // Nettoyer le localStorage après utilisation
          localStorage.removeItem('alphi-test-poem')
        } else {
          console.warn('Aucun poème de test trouvé dans localStorage')
          setAvailablePoems(poems.length > 0 ? poems : defaultPoems)
        }
      } catch (error) {
        console.error('Erreur lors du parsing du poème de test:', error)
        setAvailablePoems(poems.length > 0 ? poems : defaultPoems)
      }
    } else {
      setAvailablePoems(poems.length > 0 ? poems : defaultPoems)
    }
  }, [poems, searchParams])

  const handlePoemSelection = (poem: Poem) => {
    setSelectedPoem(poem)
    // Garder les bonnes réponses pour vérification
    setCorrectAnswers([...poem.words])
    
    // Only include words that are marked as participating in the game
    const participatingWords = poem.gameParticipatingWords || []
    const gameWords = poem.words
      .map((word, index) => participatingWords.includes(index) ? { ...word, class: '' } : null)
      .filter((word): word is GameWord => word !== null)
    
    setGameWords(gameWords)
    setCurrentStep(2)
    
    // Démarrer le timer si ce n'est pas déjà fait
    if (startTime === 0) {
      setStartTime(Date.now())
    }
  }

  const handleWordClassAssignment = (wordIndex: number, className: string) => {
    const updatedWords = [...gameWords]
    updatedWords[wordIndex].class = className
    setGameWords(updatedWords)
  }

  const getWordColorAndLetter = (word: GameWord, wordIndex: number) => {
    if (!selectedPoem) return null

    // If word is part of a group, use group color
    if (word.groupId) {
      const group = selectedPoem.wordGroups?.find(g => g.id === word.groupId)
      if (group) {
        // For groups, we need to determine what letter to use
        // We'll use the traditional class mapping for the letter, but the group color
        const wordClass = wordClasses.find(wc => wc.name === word.class)
        return {
          color: group.color,
          letter: wordClass ? wordClass.letter : 'X'
        }
      }
    }
    
    // Otherwise use traditional class-based color and letter
    const wordClass = wordClasses.find(wc => wc.name === word.class)
    return wordClass ? {
      color: wordClass.color,
      letter: wordClass.letter
    } : { color: 'bg-gray-300', letter: 'X' }
  }

  const proceedToStep3 = () => {
    if (!selectedPoem) return

    // Create a mapping of letters to colors based on the current poem's words and groups
    // Priority: custom hex colors > class colors
    const letterColorMap = new Map<string, string>()
    
    selectedPoem.words.forEach((word, index) => {
      const colorInfo = getWordColorAndLetter(word, index)
      if (colorInfo) {
        const existingColor = letterColorMap.get(colorInfo.letter)
        
        // Only overwrite if:
        // 1. No existing color, OR
        // 2. New color is hex and existing is not hex, OR  
        // 3. Both are hex (later overwrites)
        // This prioritizes custom colors over class colors
        if (!existingColor || 
            (colorInfo.color.startsWith('#') && !existingColor.startsWith('#')) ||
            (colorInfo.color.startsWith('#') && existingColor.startsWith('#'))) {
          letterColorMap.set(colorInfo.letter, colorInfo.color)
        }
      }
    })

    // Generate alphabet with the correct colors
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const coloredAlphabet: DroppedLetter[] = alphabet.map(letter => {
      const color = letterColorMap.get(letter) || 'bg-gray-300'
      return {
        letter,
        color: color.startsWith('#') ? '' : color, // Use CSS class for non-hex colors
        id: `letter-${letter}-${Math.random()}`,
        customStyle: color.startsWith('#') ? { backgroundColor: color } : undefined
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
    
    // Notification toast pour perte de vie
    toast.error(`❤️ Vie perdue ! ${newLives} vies restantes`, {
      icon: '💔',
      duration: 2000
    })
    
    if (newLives <= 0) {
      setGameOver(true)
      toast.error('💀 Jeu terminé ! Plus de vies restantes', {
        duration: 4000
      })
    }
  }

  const handleWordClassAssignmentWithLives = (wordIndex: number, className: string) => {
    const updatedWords = [...gameWords]
    const previousClass = updatedWords[wordIndex].class
    const gameWord = updatedWords[wordIndex]
    
    // Check if this word is part of a group
    const group = gameWord.groupId ? selectedPoem?.wordGroups?.find(g => g.id === gameWord.groupId) : null;
    
    if (group) {
      // Update class for all words in the group that are in gameWords
      group.wordIndices.forEach(originalIndex => {
        const participatingWords = selectedPoem?.gameParticipatingWords || [];
        const gameWordIndex = participatingWords.findIndex(pIndex => pIndex === originalIndex);
        if (gameWordIndex >= 0 && gameWordIndex < updatedWords.length) {
          updatedWords[gameWordIndex].class = className;
        }
      });
    } else {
      // Individual word
      updatedWords[wordIndex].class = className
    }
    
    setGameWords(updatedWords)
    
    // Vérifier si c'est la bonne réponse
    const correctWord = correctAnswers[wordIndex]
    if (className !== '' && className !== correctWord.class && previousClass === '') {
      loseLife()
    }
  }

  const handleLetterDrop = (letter: DroppedLetter) => {
    const targetWord = selectedPoem?.targetWord || 'HORAIRE'
    const maxLetters = targetWord.length
    
    if (droppedLetters.length < maxLetters) {
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
    const targetWord = selectedPoem?.targetWord || 'HORAIRE'
    
    if (formedWord === targetWord) {
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
    
    const correctGender = selectedPoem?.targetWordGender || 'masculin'
    
    if (gender !== correctGender) {
      loseLife()
    } else {
      // Jeu terminé avec succès - calculer et enregistrer le score
      const finalScore = calculateScore()
      setGameScore(finalScore)
      setGameOver(true) // Arrêter le timer
      toast.success(`🎉 Félicitations ! Score: ${finalScore} points`, {
        duration: 4000
      })
      
      // Enregistrer dans localStorage pour la page Mes Progrès
      const gameData = {
        date: new Date().toISOString(),
        score: finalScore,
        lives: lives,
        time: sessionTime,
        verse: selectedPoem?.verse || ''
      }
      
      const savedGames = JSON.parse(localStorage.getItem('alphi-games') || '[]')
      savedGames.push(gameData)
      localStorage.setItem('alphi-games', JSON.stringify(savedGames))
    }
  }

  // Timer useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (startTime > 0 && !gameOver) {
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [startTime, gameOver])

  // Calcul du score basé sur vies restantes et temps
  const calculateScore = () => {
    if (sessionTime === 0) return 0
    
    const baseScore = 1000
    const livesBonus = lives * 200 // Bonus pour vies restantes
    const timeBonus = Math.max(0, 300 - sessionTime) // Bonus pour rapidité (max 5 min)
    
    return baseScore + livesBonus + timeBonus
  }

  const resetGame = () => {
    setCurrentStep(1)
    setSelectedPoem(null)
    setGameWords([])
    setCorrectAnswers([])
    setFoundWord('')
    setSelectedGender('')
    setLives(3)
    setDroppedLetters([])
    setAvailableLetters([])
    setGameOver(false)
    setStartTime(0)
    setSessionTime(0)
    setGameScore(0)
  }

  const startNewGame = () => {
    resetGame()
    setStartTime(Date.now())
    toast.success('🎮 Nouveau jeu commencé !', {
      duration: 2000
    })
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
              {/* Timer avec icône horloge */}
              {startTime > 0 && (
                <div className="flex items-center space-x-2 mb-3 bg-blue-50 px-3 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-600 mr-2">Vies:</span>
                {[...Array(3)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index < lives 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'bg-gray-300 text-gray-500 opacity-50'
                    }`}
                  >
                    <span className="text-sm font-bold">♥</span>
                  </div>
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
              {availablePoems.map((poem) => (
                <div 
                  key={poem.id}
                  className="bg-gradient-to-br from-orange-200 to-pink-200 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200 border-4 border-transparent hover:border-orange-400"
                  onClick={() => handlePoemSelection(poem)}
                >
                  <div className="aspect-video bg-orange-300 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {poem.image ? (
                      <img 
                        src={poem.image} 
                        alt="Image du poème"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-6xl">🌅</span>
                    )}
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
                {selectedPoem.verse.split(' ').map((verseWord, verseIndex) => {
                  // Check if this verse word corresponds to a participating word
                  const participatingWords = selectedPoem.gameParticipatingWords || []
                  const cleanVerseWord = verseWord.replace(/[.,!?]/g, '')
                  
                  // Check if any participating word matches this verse word
                  const isParticipating = participatingWords.some(participatingIndex => {
                    const originalWord = selectedPoem.words[participatingIndex]
                    return originalWord && originalWord.word.toLowerCase() === cleanVerseWord.toLowerCase()
                  })
                  
                  return isParticipating ? (
                    <span key={verseIndex} className="font-bold text-orange-600 mx-1">
                      {verseWord}
                    </span>
                  ) : (
                    <span key={verseIndex} className="mx-1">{verseWord}</span>
                  )
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Mots à classer :</h4>
                <div className="space-y-3">
                  {(() => {
                    // Process words to handle groups properly
                    const processedWords = [];
                    const processedIndices = new Set();
                    
                    gameWords.forEach((gameWord, index) => {
                      if (processedIndices.has(index)) return;
                      
                      // Check if this word is part of a group
                      const group = gameWord.groupId ? selectedPoem.wordGroups?.find(g => g.id === gameWord.groupId) : null;
                      
                      if (group) {
                        // Find all words in this group that are in gameWords
                        const groupWordsInGame = group.wordIndices
                          .map(originalIndex => {
                            const participatingWords = selectedPoem.gameParticipatingWords || [];
                            const gameWordIndex = participatingWords.findIndex(pIndex => pIndex === originalIndex);
                            return gameWordIndex >= 0 ? gameWords[gameWordIndex] : null;
                          })
                          .filter(Boolean);
                        
                        if (groupWordsInGame.length > 0) {
                          // Display as a group
                          const groupText = groupWordsInGame.map(gw => gw.word).join(' ');
                          processedWords.push({
                            displayText: `${groupText} 👥`,
                            gameWord: gameWord, // Use the first word for class assignment
                            index: index,
                            isGroup: true
                          });
                          
                          // Mark all group members as processed
                          groupWordsInGame.forEach(gw => {
                            const idx = gameWords.findIndex(word => word === gw);
                            if (idx >= 0) processedIndices.add(idx);
                          });
                        }
                      } else {
                        // Individual word
                        processedWords.push({
                          displayText: gameWord.word,
                          gameWord: gameWord,
                          index: index,
                          isGroup: false
                        });
                        processedIndices.add(index);
                      }
                    });
                    
                    return processedWords.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-semibold text-gray-800">{item.displayText}</div>
                        <select 
                          className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                          value={item.gameWord.class}
                          onChange={(e) => handleWordClassAssignmentWithLives(item.index, e.target.value)}
                        >
                          <option value="">Choisir une classe...</option>
                          {wordClasses.map((wc) => (
                            <option key={wc.name} value={wc.name}>{wc.name}</option>
                          ))}
                        </select>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Classes de mots :</h4>
                <div className="space-y-2">
                  {wordClasses.map((wc) => (
                    <div key={wc.name} className="flex items-center">
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
                    onClick={startNewGame}
                    className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
                  >
                    Nouveau Jeu 🔄
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
            
            {/* Affichage du vers avec couleurs correspondantes */}
            {selectedPoem && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Votre sélection :</h3>
                <div className="text-center text-lg flex flex-wrap justify-center gap-2">
                  {gameWords.map((wordData, index) => {
                    const colorInfo = getWordColorAndLetter(wordData, index)
                    return (
                      <span 
                        key={index}
                        className={`px-3 py-1 rounded-full text-white font-medium ${
                          colorInfo && !colorInfo.color.startsWith('#') ? colorInfo.color : 'bg-gray-400'
                        }`}
                        style={colorInfo && colorInfo.color.startsWith('#') ? 
                          { backgroundColor: colorInfo.color } : undefined}
                      >
                        {wordData.word}
                      </span>
                    )
                  })}
                </div>
                <p className="text-center text-sm text-gray-600 mt-3">
                  Chaque couleur correspond à une classe grammaticale ou un groupe de mots de vos réponses précédentes
                </p>
              </div>
            )}

            {/* Zone de dépôt pour le mot */}
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Mot mystère :</h3>
              <div className="flex justify-center items-center space-x-2 mb-4 min-h-[80px] overflow-x-auto">
                {Array.from({ length: (selectedPoem?.targetWord || 'HORAIRE').length }).map((_, index) => (
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
                        className={`w-12 h-12 ${droppedLetters[index].color || 'bg-gray-400'} rounded-lg flex items-center justify-center cursor-pointer text-white font-bold text-xl`}
                        style={droppedLetters[index].customStyle}
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
                    className={`w-10 h-10 ${letter.color || 'bg-gray-400'} rounded-lg flex items-center justify-center cursor-pointer text-white font-bold text-base hover:scale-110 transition-transform ${gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={letter.customStyle}
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
                disabled={droppedLetters.length !== (selectedPoem?.targetWord || 'HORAIRE').length || gameOver}
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