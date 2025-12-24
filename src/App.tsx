import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { listImages } from './imageStorage'
import type { ImageListItem } from './imageStorage'
import { Auth } from './Auth'
import type { User } from '@supabase/supabase-js'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [images, setImages] = useState<ImageListItem[]>([])
  const [currentImage, setCurrentImage] = useState<ImageListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadImages()
    }
  }, [user])

  const loadImages = async () => {
    setLoading(true)
    const imageList = await listImages()
    setImages(imageList)
    if (imageList.length > 0) {
      pickRandomImage(imageList)
    }
    setLoading(false)
  }

  const pickRandomImage = (imageList: ImageListItem[] = images) => {
    if (imageList.length > 0) {
      const randomIndex = Math.floor(Math.random() * imageList.length)
      setCurrentImage(imageList[randomIndex])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-400">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-zinc-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Médias Aléatoires
        </h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Se déconnecter
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {loading ? (
          <div className="text-xl text-gray-400">Chargement des médias...</div>
        ) : images.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-gray-400 mb-4">
              Aucun média trouvé
            </p>
            <p className="text-sm text-gray-500">
              Uploadez des images ou vidéos directement sur Supabase Storage
            </p>
          </div>
        ) : currentImage ? (
          <div className="w-full max-w-4xl space-y-6">
            {/* Media Container */}
            <div className="relative bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {currentImage.type === 'video' ? (
                <video
                  src={currentImage.url}
                  controls
                  autoPlay
                  loop
                  className="w-full h-[70vh] object-contain"
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : (
                <img
                  src={currentImage.url}
                  alt={currentImage.name}
                  className="w-full h-[70vh] object-contain"
                />
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => pickRandomImage()}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                🎲 Média Aléatoire
              </button>
              <button
                onClick={loadImages}
                className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                🔄 Recharger
              </button>
            </div>

            {/* Image Info */}
            <div className="text-center text-sm text-gray-500">
              {currentImage.name}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App
