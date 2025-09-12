import { SignedIn, SignedOut } from '@clerk/nextjs'
import MigrationInterface from '../../components/migration/MigrationInterface'

export default function MigratePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignedIn>
        <MigrationInterface />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
            <p className="text-gray-600">Veuillez vous connecter pour migrer vos données</p>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}