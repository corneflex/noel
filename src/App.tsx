import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Auth } from './Auth'
import type { User } from '@supabase/supabase-js'
import { CharacterGrid } from './components/CharacterGrid'
import { CharacterDetail } from './components/CharacterDetail'
import type { Character } from './components/CharacterCard'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadCharacters()
    }
  }, [user])

  const loadCharacters = async () => {
    setLoading(true)

    // 1. Fetch characters
    const { data: charactersData, error: charactersError } = await supabase
      .from('characters')
      .select('*')
      .order('name')

    if (charactersError) {
      console.error('Error loading characters:', charactersError)
      setLoading(false)
      return
    }

    // 2. Fetch signed URLs from Edge Function
    try {
      const { data: imagesData, error: imagesError } = await supabase.functions.invoke('get-images')

      if (imagesError) {
        console.warn('Error loading private images:', imagesError)
      }

      // Map images by filename for easy lookup
      const newImageMap = new Map<string, string>()
      if (imagesData && imagesData.images) {
        imagesData.images.forEach((img: any) => {
          if (img.name && img.url) {
            newImageMap.set(img.name, img.url)
          }
        })
      }
      setImageMap(newImageMap)

      // 3. Merge data
      const mergedCharacters = (charactersData || []).map((char: any) => {
        // If character has an image_filename and we have a signed URL for it, use it
        // Otherwise fallback to the public image_url
        let finalImageUrl = char.image_url
        if (char.image_filename && newImageMap.has(char.image_filename)) {
          finalImageUrl = newImageMap.get(char.image_filename)
        }

        return {
          ...char,
          image_url: finalImageUrl
        }
      })

      setCharacters(mergedCharacters)

    } catch (err) {
      console.error('Unexpected error loading images:', err)
      // Fallback to just using character data as is
      setCharacters(charactersData || [])
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('https://www.transparenttextures.com/patterns/comic-dots.png')] bg-comic-blue text-comic-black font-reading selection:bg-comic-yellow selection:text-comic-black">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b-4 border-black bg-comic-yellow sticky top-0 z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -skew-y-1 my-4 mx-2">
        <h1
          className="text-4xl font-comic tracking-wider text-black uppercase cursor-pointer hover:scale-105 transition-transform drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]"
          onClick={() => setSelectedCharacter(null)}
        >
          Hero Select
        </h1>
        <div className="flex gap-4">
          <button
            onClick={toggleFullScreen}
            className="px-6 py-2 bg-comic-blue text-white font-comic text-xl uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Full Screen
          </button>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-comic-red text-white font-comic text-xl uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-4xl font-comic text-white animate-bounce drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Loading Heroes...
            </div>
          </div>
        ) : selectedCharacter ? (
          <CharacterDetail
            character={selectedCharacter}
            imageMap={imageMap}
            onBack={() => setSelectedCharacter(null)}
          />
        ) : (
          <CharacterGrid
            characters={characters}
            onSelectCharacter={setSelectedCharacter}
          />
        )}
      </main>
    </div>
  )
}

export default App
