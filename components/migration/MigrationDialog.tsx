'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { 
  migrateLocalStorageToSupabase, 
  checkMigrationStatus 
} from '@/lib/supabase/migrations/data-migration'

interface MigrationDialogProps {
  isOpen: boolean
  onClose: () => void
  onMigrationComplete?: () => void
}

export default function MigrationDialog({ 
  isOpen, 
  onClose, 
  onMigrationComplete 
}: MigrationDialogProps) {
  const { user } = useUser()
  const { session } = useSession()
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

  // Check migration status when dialog opens
  useEffect(() => {
    if (isOpen && user && session) {
      checkStatus()
    }
  }, [isOpen, user, session])

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
      
      if (results.errors.length === 0) {
        // Migration successful
        if (onMigrationComplete) {
          onMigrationComplete()
        }
      }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Migration des données</h2>
        
        {!migrationStatus ? (
          <div className="text-center py-4">
            <p>Vérification du statut de migration...</p>
          </div>
        ) : migrationResults ? (
          <div>
            <h3 className="font-semibold mb-2">Résultats de la migration</h3>
            <div className="space-y-2">
              <p className="text-green-600">✅ {migrationResults.poemsCount} poèmes migrés</p>
              <p className="text-green-600">✅ {migrationResults.progressCount} sessions de jeu migrées</p>
              {migrationResults.statsCreated && (
                <p className="text-green-600">✅ Statistiques créées</p>
              )}
              
              {migrationResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600">Erreurs:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {migrationResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : migrationStatus.needsMigration ? (
          <div>
            <div className="mb-4">
              <p className="mb-2">Des données locales ont été détectées:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {migrationStatus.hasLocalStorageData && (
                  <li>Poèmes et données de jeu dans le stockage local</li>
                )}
              </ul>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Voulez-vous migrer ces données vers votre compte Supabase? 
              Cela permettra de synchroniser vos données entre appareils et de les sauvegarder en sécurité.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Plus tard
              </button>
              <button
                onClick={handleMigration}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Migration...' : 'Migrer les données'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">
              {migrationStatus.hasSupabaseData 
                ? 'Vos données sont déjà synchronisées avec Supabase.' 
                : 'Aucune donnée locale à migrer trouvée.'}
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}