import { ImageWithLoader } from './ImageWithLoader'

export interface Character {
  id: string
  name: string
  description: string
  image_url: string
  thumbnail_url?: string // Optional thumbnail for grid view
  image_filename?: string // Optional filename for private images
  stats: Record<string, number>
}

interface CharacterCardProps {
  character: Character
  onClick: (character: Character) => void
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <div
      onClick={() => onClick(character)}
      className="group relative cursor-pointer overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200"
    >
      <div className="aspect-[2/3] w-full overflow-hidden border-b-4 border-black relative">
        <ImageWithLoader
          src={character.image_url}
          thumbnailSrc={character.thumbnail_url}
          alt={character.name}
          className="h-full w-full"
          imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 md:grayscale md:group-hover:grayscale-0"
        />
        {/* Comic Halftone Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/comic-dots.png')] opacity-20 pointer-events-none mix-blend-multiply" />
      </div>

      <div className="p-4 bg-comic-yellow relative overflow-hidden">
        {/* Decorative corner triangle */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-comic-red border-l-4 border-b-4 border-black transform translate-x-4 -translate-y-4 rotate-45" />

        <h3 className="text-2xl font-comic tracking-wide text-black uppercase mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">
          {character.name}
        </h3>
        <p className="text-sm font-reading font-bold text-black/80 line-clamp-2 leading-tight">
          {character.description}
        </p>
      </div>
    </div>
  )
}
