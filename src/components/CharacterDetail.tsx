import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Character } from './CharacterCard'
import { ImageWithLoader } from './ImageWithLoader'
import { supabase } from '../supabaseClient'

interface CharacterDetailProps {
    characters: Character[]
    imageMap?: Map<string, { full: string, thumb: string }>
}

export function CharacterDetail({ characters, imageMap }: CharacterDetailProps) {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Find character from the list passed down
    const character = characters.find(c => c.id === id)

    const [slideshowImages, setSlideshowImages] = useState<string[]>([])
    const [currentSlide, setCurrentSlide] = useState(0)

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-4xl font-comic mb-4">Hero Not Found!</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-comic-red text-white font-comic text-xl border-4 border-black"
                >
                    Return to HQ
                </button>
            </div>
        )
    }

    const onBack = () => navigate('/')

    // Action Gallery State
    const [actionGalleryMedia, setActionGalleryMedia] = useState<{ url: string, type: 'image' | 'video' }[]>([])
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

    useEffect(() => {
        const fetchImages = async () => {
            // Start with the main image/slideshow
            const profileImages = [character.image_url]
            const galleryMedia: { url: string, type: 'image' | 'video' }[] = [
                { url: character.image_url, type: 'image' }
            ]

            // Fetch linked images from database
            const { data, error } = await supabase
                .from('character_images')
                .select('image_filename, category')
                .eq('character_id', character.id)

            if (!error && data && imageMap) {
                data.forEach((row: any) => {
                    const filename = row.image_filename
                    const category = row.category || 'profile'

                    if (imageMap.has(filename)) {
                        const url = imageMap.get(filename)!.full

                        // Check file type
                        const isVideo = filename.toLowerCase().match(/\.(mp4|webm|mov)$/)
                        const type = isVideo ? 'video' : 'image'

                        if (category === 'gallery') {
                            galleryMedia.push({ url, type })
                        } else {
                            // Default to profile slideshow
                            profileImages.push(url)
                            // PRO TIP: Profile images are ALSO added to the Action Gallery!
                            galleryMedia.push({ url, type })
                        }
                    }
                })
            }
            setSlideshowImages(profileImages)
            setActionGalleryMedia(galleryMedia)
        }
        fetchImages()
    }, [character, imageMap])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slideshowImages.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length)
    }

    // Prefetching Logic
    useEffect(() => {
        if (slideshowImages.length > 0) {
            const nextIndex = (currentSlide + 1) % slideshowImages.length
            const img = new Image()
            img.src = slideshowImages[nextIndex]
        }
    }, [currentSlide, slideshowImages])

    useEffect(() => {
        if (actionGalleryMedia.length > 0) {
            const nextIndex = (currentGalleryIndex + 1) % actionGalleryMedia.length
            const media = actionGalleryMedia[nextIndex]
            if (media.type === 'image') {
                const img = new Image()
                img.src = media.url
            }
        }
    }, [currentGalleryIndex, actionGalleryMedia])

    // Gallery Navigation
    const nextGalleryMedia = () => {
        setCurrentGalleryIndex((prev) => (prev + 1) % actionGalleryMedia.length)
    }

    const prevGalleryMedia = () => {
        setCurrentGalleryIndex((prev) => (prev - 1 + actionGalleryMedia.length) % actionGalleryMedia.length)
    }

    return (
        <>
            {/* Fullscreen Action Gallery Overlay */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
                    <button
                        onClick={() => setIsGalleryOpen(false)}
                        className="absolute top-8 right-8 text-white font-comic text-4xl hover:text-comic-red bg-black/50 rounded-full w-16 h-16 border-2 border-white z-50 flex items-center justify-center"
                    >
                        ✕
                    </button>

                    <button
                        onClick={prevGalleryMedia}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-comic text-6xl hover:text-comic-yellow drop-shadow-lg z-50"
                    >
                        ❮
                    </button>

                    <div className="absolute inset-0 p-4 flex items-center justify-center pointer-events-none">
                        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                            {actionGalleryMedia[currentGalleryIndex].type === 'video' ? (
                                <video
                                    src={actionGalleryMedia[currentGalleryIndex].url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                />
                            ) : (
                                <ImageWithLoader
                                    src={actionGalleryMedia[currentGalleryIndex].url}
                                    alt="Action Gallery"
                                    className="w-full h-full flex items-center justify-center"
                                    imageClassName="max-w-full max-h-full object-contain border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                    priority={currentGalleryIndex === 0}
                                />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={nextGalleryMedia}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-comic text-6xl hover:text-comic-yellow drop-shadow-lg z-50"
                    >
                        ❯
                    </button>

                    {/* Counter */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-comic text-2xl">
                        {currentGalleryIndex + 1} / {actionGalleryMedia.length}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row h-full w-full max-w-7xl mx-auto overflow-hidden bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300 relative">
                {/* "TOP SECRET" Stamp */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 border-2 md:border-4 border-red-600 text-red-600 px-2 py-1 md:px-4 md:py-2 font-black text-sm md:text-2xl uppercase opacity-80 -rotate-12 pointer-events-none">
                    Top Secret
                </div>

                {/* Left Column: Image & Slideshow */}
                <div className="w-full md:w-1/2 relative border-b-8 md:border-b-0 md:border-r-8 border-black bg-black">
                    <div className="absolute top-4 left-4 z-10">
                        <button
                            onClick={onBack}
                            className="px-6 py-2 bg-comic-blue text-white font-comic text-xl uppercase border-4 border-black hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            ← Back
                        </button>
                    </div>

                    {/* Main Image Display */}
                    <div className="w-full h-full relative aspect-[2/3] md:aspect-auto">
                        {slideshowImages.length > 0 ? (
                            <ImageWithLoader
                                src={slideshowImages[currentSlide]}
                                alt={character.name}
                                className="w-full h-full"
                                imageClassName="w-full h-full object-cover contrast-125 transition-opacity duration-300"
                                priority={true}
                            />
                        ) : (
                            <ImageWithLoader
                                src={character.image_url}
                                alt={character.name}
                                className="w-full h-full"
                                imageClassName="w-full h-full object-cover contrast-125"
                                priority={true}
                            />
                        )}

                        {/* Check if slideshow controls are needed */}
                        {slideshowImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-comic-yellow text-black border-4 border-black p-2 hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20"
                                >
                                    <span className="font-comic text-2xl">❮</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-comic-yellow text-black border-4 border-black p-2 hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20"
                                >
                                    <span className="font-comic text-2xl">❯</span>
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                    {slideshowImages.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-3 h-3 border-2 border-black ${idx === currentSlide ? 'bg-comic-red' : 'bg-white'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    {/* Halftone Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/comic-dots.png')] opacity-30 pointer-events-none mix-blend-multiply" />
                </div>

                {/* Right Column: Stats & Info */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-comic-yellow bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                    <h2 className="text-5xl md:text-7xl font-comic text-black mb-4 drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] uppercase tracking-wider -skew-x-6">
                        {character.name}
                    </h2>

                    <div className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                        <h3 className="text-xl font-comic text-comic-red mb-2 uppercase">Hero Bio:</h3>
                        <p className="text-black font-reading text-xl leading-relaxed font-bold">
                            {character.description}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <h3 className="text-3xl font-comic text-black uppercase mb-2">Power Levels</h3>
                        {Object.entries(character.stats).map(([statName, statValue]) => (
                            <div
                                key={statName}
                                className="flex items-center gap-4"
                            >
                                <div className="w-32 text-right">
                                    <span className="text-black font-comic text-xl uppercase tracking-wider bg-white px-2 border-2 border-black inline-block transform -skew-x-12">
                                        {statName}
                                    </span>
                                </div>

                                {/* Stat Bar */}
                                <div className="flex-1 h-6 bg-white border-4 border-black relative skew-x-12">
                                    <div
                                        className="h-full bg-comic-red transition-all duration-1000 ease-out border-r-4 border-black"
                                        style={{ width: `${Math.min(statValue, 100)}%` }}
                                    />
                                    {/* Striped pattern overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] bg-[length:10px_10px]" />
                                </div>
                                <div className="w-12 font-black font-comic text-2xl text-black">
                                    {statValue}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Gallery Button */}
                    {actionGalleryMedia.length > 0 && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setIsGalleryOpen(true)}
                                className="px-8 py-3 bg-white backdrop-blur-md text-black font-comic text-2xl uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all animate-bounce"
                            >
                                🎬 View Action Gallery
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
