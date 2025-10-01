import Card from "@/components/home/card";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="z-10 w-full max-w-4xl px-5 xl:px-0">
        <div className="mx-auto mb-5 flex max-w-fit animate-fade-up items-center justify-center space-x-2 overflow-hidden rounded-full bg-orange-100 px-7 py-2 transition-colors">
          <span className="text-2xl">🎯</span>
          <p className="text-sm font-semibold text-orange-600">
            Application Éducative pour le Québec
          </p>
        </div>

        <h1
          className="animate-fade-up bg-gradient-to-br from-orange-600 to-red-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-7xl md:leading-[5rem]"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          Alphi - Jeux de Grammaire
        </h1>

        <p
          className="mt-6 animate-fade-up text-center text-gray-600 opacity-0 [text-wrap:balance] md:text-xl"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          Une application éducative amusante pour apprendre la grammaire
          française à travers des jeux interactifs adaptés aux enfants du
          Québec.
        </p>

        <div
          className="mx-auto mt-8 flex animate-fade-up items-center justify-center space-x-5 opacity-0"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <SignedOut>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <SignInButton mode="modal">
                <button className="group flex max-w-fit items-center justify-center space-x-2 rounded-full bg-orange-500 px-6 py-3 text-white shadow-lg transition-colors hover:bg-orange-600">
                  <span className="text-lg">🎮</span>
                  <p className="font-semibold">Commencer à Jouer</p>
                </button>
              </SignInButton>
              <Link href="/decouverte">
                <button className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border-2 border-orange-500 bg-white px-6 py-3 text-orange-500 shadow-md transition-colors hover:bg-orange-50">
                  <span className="text-lg">✨</span>
                  <p className="font-semibold">Découvrir sans compte</p>
                </button>
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <Link href="/jeu">
              <button className="group flex max-w-fit items-center justify-center space-x-2 rounded-full bg-orange-500 px-6 py-3 text-white shadow-lg transition-colors hover:bg-orange-600">
                <span className="text-lg">🎮</span>
                <p className="font-semibold">Commencer à Jouer</p>
              </button>
            </Link>
          </SignedIn>

          {/* <Link href="/admin">
            <button className="flex max-w-fit items-center justify-center space-x-2 rounded-full border-2 border-orange-500 bg-white px-6 py-3 text-orange-500 shadow-md transition-colors hover:bg-orange-50">
              <span className="text-lg">👩‍🏫</span>
              <p className="font-semibold">Administration</p>
            </button>
          </Link> */}
        </div>

        {/* Section illustrative avec des enfants */}
        <div
          className="mt-12 animate-fade-up rounded-3xl bg-gradient-to-r from-orange-100 via-pink-50 to-teal-100 p-8 opacity-0"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <div className="text-center">
            <div className="mb-4 text-6xl">🎨👦👧🎪</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-800">
              Apprentissage Ludique et Interactif
            </h3>
            <p className="mx-auto max-w-2xl text-gray-600">
              Nos jeux permettent aux enfants d'apprendre la grammaire française
              de manière amusante à travers des poèmes, des images colorées et
              des défis adaptés à leur âge.
            </p>
          </div>
        </div>
      </div>

      <div className="my-10 grid w-full max-w-screen-xl animate-fade-up grid-cols-1 gap-6 px-5 md:grid-cols-3 xl:px-0">
        {features.map(({ title, description, demo, large }) => (
          <Card
            key={title}
            title={title}
            className="px-2 !text-inherit"
            description={description}
            demo={demo}
            large={large}
          />
        ))}
      </div>
    </>
  );
}

const features = [
  {
    title: "🎯 Apprentissage Interactif",
    description:
      "Jeux éducatifs basés sur la poésie et la grammaire française, conçus spécialement pour les enfants du Québec.",
    demo: (
      <div className="flex items-center justify-center space-x-4 text-4xl">
        <span>📚</span>
        <span>🎨</span>
        <span>🎪</span>
      </div>
    ),
    large: true,
  },
  {
    title: "🏫 Interface Administrateur",
    description:
      "Outils complets pour les éducateurs : gestion du contenu, suivi des progrès, et analyse des performances des élèves.",
    demo: (
      <div className="flex items-center justify-center space-x-2">
        <div className="rounded-lg bg-orange-400 p-2 text-xs font-semibold text-white">
          ADMIN
        </div>
        <div className="rounded-lg bg-teal-400 p-2 text-xs font-semibold text-white">
          STATS
        </div>
      </div>
    ),
  },
  {
    title: "🎮 Jeu en 4 Étapes",
    description:
      "Processus d'apprentissage structuré : sélection d'image, classification des mots, découverte de mots, et identification du genre.",
    demo: (
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded bg-orange-100 p-1">1. Image</div>
        <div className="rounded bg-teal-100 p-1">2. Mots</div>
        <div className="rounded bg-pink-100 p-1">3. Lettres</div>
        <div className="rounded bg-purple-100 p-1">4. Genre</div>
      </div>
    ),
  },
  {
    title: "🔐 Authentification Sécurisée",
    description:
      "Système d'authentification robuste via Clerk pour protéger les données des enfants et respecter les normes de confidentialité.",
    demo: (
      <div className="flex items-center justify-center space-x-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400 text-xs font-bold text-white">
          ✓
        </div>
        <span className="text-sm font-semibold text-gray-600">Sécurisé</span>
      </div>
    ),
  },
  {
    title: "📈 Suivi des Progrès",
    description:
      "Tableaux de bord détaillés pour suivre l'évolution des élèves et identifier les domaines d'amélioration.",
    demo: (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span>Grammaire</span>
          <span className="font-bold text-green-500">85%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-green-500"
            style={{ width: "85%" }}
          ></div>
        </div>
      </div>
    ),
  },
];
