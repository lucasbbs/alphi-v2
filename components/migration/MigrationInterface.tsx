'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { 
  checkMigrationStatus, 
  migrateLocalStorageToSupabase 
} from '@/lib/supabase/migrations/data-migration'
import { useSupabasePoems } from '@/lib/supabase/hooks/useSupabasePoems'

export default function MigrationInterface() {
  const { user } = useUser()
  const { session } = useSession()
  const { poems, loading: poemsLoading, fetchPoems } = useSupabasePoems()
  
  const [migrationStatus, setMigrationStatus] = useState<{
    hasLocalStorageData: boolean
    hasSupabaseData: boolean
    needsMigration: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResults, setMigrationResults] = useState<{
    poemsCount: number
    progressCount: number
    statsCreated: boolean
    errors: string[]
  } | null>(null)

  useEffect(() => {
    if (user && session) {
      checkStatus()
    }
  }, [user, session])

  const checkStatus = async () => {
    if (!user || !session) return
    
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      if (!sessionToken) return
      
      const status = await checkMigrationStatus(sessionToken, user.id)
      setMigrationStatus(status)
    } catch (error) {
      console.error('Failed to check migration status:', error)
    }
  }

  const handleMigration = async () => {
    if (!user || !session) return
    
    setIsLoading(true)
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      if (!sessionToken) return
      
      const results = await migrateLocalStorageToSupabase(sessionToken, user.id)
      setMigrationResults(results)
      
      // Refresh the status and poems list
      await checkStatus()
      await fetchPoems()
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationResults({
        poemsCount: 0,
        progressCount: 0,
        statsCreated: false,
        errors: [`Migration failed: ${error}`]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getLocalStorageInfo = () => {
    const adminPoems = localStorage.getItem('alphi-admin-poems')
    const testPoem = localStorage.getItem('alphi-test-poem')
    const gameHistory = localStorage.getItem('alphi-games')
    
    return {
      adminPoemsCount: adminPoems ? JSON.parse(adminPoems).length : 0,
      hasTestPoem: !!testPoem,
      gameHistoryCount: gameHistory ? JSON.parse(gameHistory).length : 0
    }
  }

  const localInfo = getLocalStorageInfo()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Migration des données</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">État actuel</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-700">Stockage local:</h3>
              <ul className="text-sm text-gray-600 mt-1">
                <li>• {localInfo.adminPoemsCount} poèmes d'administration</li>
                <li>• {localInfo.gameHistoryCount} sessions de jeu</li>
                <li>• {localInfo.hasTestPoem ? 'Poème de test présent' : 'Pas de poème de test'}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Base de données:</h3>
              <p className="text-sm text-gray-600">
                {poemsLoading ? 'Chargement...' : `${poems.length} poèmes synchronisés`}
              </p>
            </div>
            
            {migrationStatus && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className="text-sm font-medium">
                  {migrationStatus.needsMigration 
                    ? '⚠️ Migration recommandée'
                    : migrationStatus.hasSupabaseData 
                      ? '✅ Données synchronisées'
                      : 'ℹ️ Aucune donnée à migrer'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Migration Actions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Actions de migration</h2>
          
          {migrationResults ? (
            <div className="space-y-3">
              <h3 className="font-medium text-green-600">Migration terminée !</h3>
              <div className="text-sm space-y-1">
                <p>✅ {migrationResults.poemsCount} poèmes migrés</p>
                <p>✅ {migrationResults.progressCount} sessions de jeu migrées</p>
                {migrationResults.statsCreated && (
                  <p>✅ Statistiques utilisateur créées</p>
                )}
              </div>
              
              {migrationResults.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded">
                  <h4 className="text-sm font-medium text-red-800">Erreurs:</h4>
                  <ul className="list-disc list-inside text-xs text-red-700 mt-1">
                    {migrationResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button
                onClick={() => setMigrationResults(null)}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Migrez vos données locales vers Supabase pour une sauvegarde sécurisée 
                et une synchronisation entre appareils.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleMigration}
                  disabled={isLoading || !migrationStatus?.needsMigration}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Migration en cours...' : 'Démarrer la migration'}
                </button>
                
                <button
                  onClick={checkStatus}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                >
                  Actualiser le statut
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Poems Display */}
      {poems.length > 0 && (
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Poèmes dans Supabase ({poems.length})</h2>
          <div className="grid gap-3">
            {poems.slice(0, 5).map((poem) => (
              <div key={poem.id} className="border rounded p-3">
                <div className="font-medium">{poem.verse.substring(0, 50)}...</div>
                <div className="text-sm text-gray-500">
                  Mot mystère: {poem.targetWord} | 
                  Créé: {new Date(poem.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {poems.length > 5 && (
              <p className="text-sm text-gray-500">... et {poems.length - 5} autres poèmes</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}