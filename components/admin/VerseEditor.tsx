"use client";

import React, { useState, useEffect } from "react";
import { GameWord, WordGroup } from "@/lib/store/gameSlice";
import ColorPicker from "./ColorPicker";

const wordClasses = [
  { name: "adverbe", color: "bg-orange-400" },
  { name: "déterminant défini", color: "bg-pink-400" },
  { name: "verbe", color: "bg-green-400" },
  { name: "déterminant possessif", color: "bg-yellow-400" },
  { name: "adjectif", color: "bg-red-400" },
  { name: "préposition", color: "bg-green-400" },
  { name: "nom commun", color: "bg-blue-400" },
  { name: "pronom", color: "bg-purple-400" },
  { name: "conjonction", color: "bg-indigo-400" },
  { name: "interjection", color: "bg-cyan-400" },
];

interface VerseEditorProps {
  verse: string;
  words: GameWord[];
  wordGroups: WordGroup[];
  onVerseChange: (verse: string) => void;
  onWordsChange: (words: GameWord[]) => void;
  onWordGroupsChange: (groups: WordGroup[]) => void;
}

export default function VerseEditor({
  verse,
  words,
  wordGroups,
  onVerseChange,
  onWordsChange,
  onWordGroupsChange,
}: VerseEditorProps) {
  const [parsedWords, setParsedWords] = useState<GameWord[]>([]);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#EF4444");

  // Fonction d'attribution automatique des classes grammaticales
  const autoClassifyWord = (word: string): string => {
    const cleanWord = word.toLowerCase().replace(/['']/g, "'");

    // Déterminants définis
    if (
      ["le", "la", "les", "l'", "du", "des", "au", "aux"].includes(cleanWord)
    ) {
      return "déterminant défini";
    }

    // Déterminants possessifs
    if (
      [
        "mon",
        "ma",
        "mes",
        "ton",
        "ta",
        "tes",
        "son",
        "sa",
        "ses",
        "notre",
        "nos",
        "votre",
        "vos",
        "leur",
        "leurs",
      ].includes(cleanWord)
    ) {
      return "déterminant possessif";
    }

    // Prépositions communes
    if (
      [
        "à",
        "de",
        "dans",
        "sur",
        "sous",
        "avec",
        "sans",
        "pour",
        "par",
        "entre",
        "vers",
        "chez",
        "depuis",
        "pendant",
        "après",
        "avant",
      ].includes(cleanWord)
    ) {
      return "préposition";
    }

    // Pronoms
    if (
      [
        "je",
        "tu",
        "il",
        "elle",
        "nous",
        "vous",
        "ils",
        "elles",
        "me",
        "te",
        "se",
        "lui",
        "leur",
        "y",
        "en",
        "qui",
        "que",
        "dont",
        "où",
      ].includes(cleanWord)
    ) {
      return "pronom";
    }

    // Conjonctions
    if (
      [
        "et",
        "ou",
        "mais",
        "car",
        "donc",
        "or",
        "ni",
        "que",
        "si",
        "comme",
        "quand",
        "lorsque",
        "puisque",
      ].includes(cleanWord)
    ) {
      return "conjonction";
    }

    // Adverbes fréquents
    if (
      [
        "très",
        "bien",
        "mal",
        "plus",
        "moins",
        "beaucoup",
        "peu",
        "trop",
        "assez",
        "encore",
        "déjà",
        "jamais",
        "toujours",
        "souvent",
        "parfois",
        "hier",
        "aujourd'hui",
        "demain",
        "maintenant",
        "bientôt",
        "tard",
        "tôt",
      ].includes(cleanWord)
    ) {
      return "adverbe";
    }

    // Verbes courants (infinitif et conjugaisons fréquentes)
    if (
      cleanWord.match(/(er|ir|re|oir)$/) ||
      [
        "est",
        "était",
        "sera",
        "avoir",
        "être",
        "faire",
        "aller",
        "venir",
        "voir",
        "savoir",
        "pouvoir",
        "vouloir",
        "dire",
        "prendre",
        "donner",
        "mettre",
        "porter",
        "laisser",
        "rester",
        "devenir",
        "tenir",
        "arriver",
        "passer",
        "partir",
        "sortir",
        "entrer",
        "monter",
        "descendre",
        "tomber",
        "viendra",
        "viendrait",
      ].includes(cleanWord)
    ) {
      return "verbe";
    }

    // Adjectifs courants (patterns simples)
    if (cleanWord.match(/(able|ible|eux|euse|ique|al|elle|if|ive|ant|ent)$/)) {
      return "adjectif";
    }

    // Noms (par défaut pour les mots non classés)
    return "nom commun";
  };

  // Analyser le vers en mots quand il change
  useEffect(() => {
    if (verse.trim()) {
      const wordTokens = verse
        .split(/(\s+|[.,;:!?()\"'’])/)
        .filter(
          (token) =>
            token.trim() &&
            !/^\s+$/.test(token) &&
            !/^[.,;:!?()\"'’]+$/.test(token),
        );

      const newWords: GameWord[] = wordTokens.map((word, index) => {
        const existingWord = words.find((w) => w.word === word);
        return (
          existingWord || {
            word,
            class: autoClassifyWord(word), // Attribution automatique
            isSelected: false,
          }
        );
      });

      setParsedWords(newWords);
      onWordsChange(newWords);
    } else {
      setParsedWords([]);
      onWordsChange([]);
    }
  }, [verse]);

  const handleClassChange = (wordIndex: number, className: string) => {
    const updatedWords = [...parsedWords];
    updatedWords[wordIndex] = { ...updatedWords[wordIndex], class: className };
    setParsedWords(updatedWords);
    onWordsChange(updatedWords);
  };

  const handleWordSelection = (wordIndex: number) => {
    setSelectedWordIndices((prev) =>
      prev.includes(wordIndex)
        ? prev.filter((i) => i !== wordIndex)
        : [...prev, wordIndex].sort((a, b) => a - b),
    );
  };

  const createWordGroup = () => {
    if (selectedWordIndices.length === 0 || !newGroupName.trim()) return;

    const newGroup: WordGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      color: newGroupColor,
      wordIndices: selectedWordIndices,
    };

    // Update words to include group ID
    const updatedWords = [...parsedWords];
    selectedWordIndices.forEach((index) => {
      updatedWords[index] = { ...updatedWords[index], groupId: newGroup.id };
    });

    // Update groups
    const updatedGroups = [...wordGroups, newGroup];

    setParsedWords(updatedWords);
    onWordsChange(updatedWords);
    onWordGroupsChange(updatedGroups);

    // Reset selection and form
    setSelectedWordIndices([]);
    setNewGroupName("");
    setNewGroupColor("#EF4444");
    setIsCreatingGroup(false);
  };

  const removeWordGroup = (groupId: string) => {
    // Remove group from words
    const updatedWords = parsedWords.map((word) =>
      word.groupId === groupId ? { ...word, groupId: undefined } : word,
    );

    // Remove group from groups array
    const updatedGroups = wordGroups.filter((group) => group.id !== groupId);

    setParsedWords(updatedWords);
    onWordsChange(updatedWords);
    onWordGroupsChange(updatedGroups);
  };

  const getWordColor = (word: GameWord, index: number) => {
    // If word is part of a group, use group color
    if (word.groupId) {
      const group = wordGroups.find((g) => g.id === word.groupId);
      if (group) {
        return { backgroundColor: group.color };
      }
    }

    // Otherwise use traditional class-based color
    const wordClass = wordClasses.find((wc) => wc.name === word.class);
    return wordClass
      ? { className: wordClass.color }
      : { className: "bg-gray-200" };
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Vers du poème
        </label>
        <textarea
          value={verse}
          onChange={(e) => onVerseChange(e.target.value)}
          placeholder="Saisissez le vers du poème ici..."
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
        />
        <p className="mt-1 text-sm text-gray-500">
          Le vers sera automatiquement analysé et les classes grammaticales
          attribuées. Vous pouvez les modifier si nécessaire.
        </p>
      </div>

      {parsedWords.length > 0 && (
        <div>
          <label className="mb-4 block text-sm font-medium text-gray-700">
            Classification grammaticale des mots
          </label>

          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Prévisualisation :
            </h4>
            <div className="flex flex-wrap gap-2">
              {parsedWords.map((word, index) => {
                const colorStyle = getWordColor(word, index);
                return (
                  <span
                    key={index}
                    className={`rounded px-2 py-1 text-sm font-medium text-white ${
                      colorStyle.className || ""
                    } ${
                      selectedWordIndices.includes(index)
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    style={
                      colorStyle.backgroundColor
                        ? { backgroundColor: colorStyle.backgroundColor }
                        : undefined
                    }
                    onClick={() => handleWordSelection(index)}
                  >
                    {word.word}
                    {word.groupId && <span className="ml-1 text-xs">👥</span>}
                  </span>
                );
              })}
            </div>
            {selectedWordIndices.length > 0 && (
              <div className="mt-4 rounded border-l-4 border-blue-400 bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  {selectedWordIndices.length} mot(s) sélectionné(s):{" "}
                  {selectedWordIndices
                    .map((i) => parsedWords[i].word)
                    .join(", ")}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingGroup(true)}
                    className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                  >
                    Créer un Groupe
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWordIndices([])}
                    className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
                  >
                    Désélectionner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Word Groups Management */}
          {wordGroups.length > 0 && (
            <div className="mb-4 rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                Groupes de mots :
              </h4>
              <div className="space-y-2">
                {wordGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded border bg-white p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm font-medium">{group.name}</span>
                      <span className="text-xs text-gray-500">
                        (
                        {group.wordIndices
                          .map((i) => parsedWords[i]?.word)
                          .join(", ")}
                        )
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWordGroup(group.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Group Modal */}
          {isCreatingGroup && (
            <div className="mb-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-700">
                Créer un nouveau groupe
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="ex: Groupe verbal, Complément..."
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <ColorPicker
                  selectedColor={newGroupColor}
                  onColorChange={setNewGroupColor}
                  label="Couleur du groupe"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={createWordGroup}
                    disabled={!newGroupName.trim()}
                    className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 disabled:bg-gray-300"
                  >
                    Créer le Groupe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setNewGroupName("");
                      setNewGroupColor("#EF4444");
                    }}
                    className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choisir une classe...</option>
                  {wordClasses.map((wc) => (
                    <option key={wc.name} value={wc.name}>
                      {wc.name}
                    </option>
                  ))}
                </select>
                {word.class && (
                  <div
                    className={`h-6 w-6 rounded ${
                      getWordColor(word, index).className || ""
                    }`}
                    style={
                      getWordColor(word, index).backgroundColor
                        ? {
                            backgroundColor: getWordColor(word, index)
                              .backgroundColor,
                          }
                        : undefined
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
